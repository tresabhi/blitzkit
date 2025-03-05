using System.Data;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Text.Unicode;
using System.Threading.Tasks;
using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Quicktype.Locales;
using BlitzKit.CLI.Utils;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.UE4.Pak.Objects;
using CUE4Parse.Utils;
using Google.Protobuf;
using Google.Protobuf.Collections;
using Newtonsoft.Json.Linq;
using YamlDotNet.Serialization;

namespace BlitzKit.CLI.Functions
{
  public class Mangler(string[] args)
  {
    readonly BlitzProvider provider = new(args.Contains("--depot"));
    Locales? locales;
    readonly List<FileChange> changes = [];
    readonly Dictionary<string, Dictionary<string, string>> strings = [];

    public async Task Mangle()
    {
      await FetchStrings();
      MangleNations();
      await BlitzKitAssets.CommitAssets("ue assets", changes);
    }

    I18n GetString(string name)
    {
      I18n i18n = new();

      if (strings[locales!.Default].TryGetValue(name, out var defaultString))
      {
        foreach (var locale in locales!.Supported)
        {
          if (strings[locale.Locale].TryGetValue(name, out var localeString))
          {
            if (locale.Locale == locales.Default || localeString != defaultString)
            {
              i18n.Locales[locale.Locale] = localeString;
            }
          }
          else
          {
            PrettyLog.Warn($"String missing from {locale.Locale} locale: {name}");
          }
        }
      }
      else
      {
        PrettyLog.Warn($"String missing from default locale: {name}");
        i18n.Locales[locales!.Default] = name;
      }

      return i18n;
    }

    async Task FetchStrings()
    {
      using var client = new HttpClient();
      var text = File.ReadAllText("../../packages/i18n/locales.json");
      this.locales =
        JsonSerializer.Deserialize<Locales>(text)
        ?? throw new Exception("Failed to deserialize locales");

      foreach (var locale in locales.Supported)
      {
        var blitzLocale = locale.Blitz ?? locale.Locale;
        var url =
          $"{Unpacker.WG_DLC_DOMAIN}/dlc/{Unpacker.CONTENT_GROUP}/ue_localizations/development/stuff/{blitzLocale}.yaml";
        var yaml = await client.GetStringAsync(url);
        var deserializer = new DeserializerBuilder().Build();
        var parsedYaml = deserializer.Deserialize<Dictionary<string, string>>(yaml);

        strings[locale.Locale] = parsedYaml;
      }
    }

    void MangleNations()
    {
      var dirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;
      List<Tank> tanksRaw = [];

      foreach (var dir in dirs)
      {
        if (dir.Key == "TankStub")
          continue;

        foreach (var tankDir in dir.Value.Directories)
        {
          // if (tankDir.Value.Name != "R90_IS_4")
          //   continue;

          tanksRaw.Add(MangleTank(tankDir.Value));
        }
      }

      DeduplicateSlugs(tanksRaw);

      Tanks tanks = new();

      foreach (var tank in tanksRaw)
      {
        TankMeta tankMeta = new() { Id = tank.Id, Slug = tank.Slug };
        tanks.Tanks_.Add(tankMeta);
      }

      changes.Add(new("definitions/tanks.pb", tanks.ToByteArray()));
    }

    void DeduplicateSlugs(List<Tank> tanks)
    {
      List<string> checkedSlugs = [];
      Dictionary<string, List<Tank>> duplicates = [];

      foreach (var tank in tanks)
      {
        if (checkedSlugs.Contains(tank.Slug))
          continue;

        checkedSlugs.Add(tank.Slug);

        foreach (var otherTank in tanks)
        {
          if (otherTank.Slug.Equals(tank.Slug) && !otherTank.Id.Equals(tank.Id))
          {
            var thisDuplicates = duplicates.GetOrAdd(tank.Slug, () => [tank]);
            thisDuplicates.Add(otherTank);
          }
        }
      }

      if (duplicates.Count > 0)
      {
        PrettyLog.Warn($"{duplicates.Count} duplicate slugs found, attempting strategies...");
      }

      foreach (var duplicate in duplicates)
      {
        Console.WriteLine($"{duplicate.Key}:");

        foreach (var tank in duplicate.Value)
        {
          Console.WriteLine($"\t{tank.Id}");
        }

        if (duplicate.Value.Count != 2)
        {
          throw new Exception(
            $"Found an unsupported {duplicate.Value.Count} duplicates for {duplicate.Key}"
          );
        }

        if (duplicate.Value.Any(tank => tank.Id.EndsWith("TU")))
        {
          PrettyLog.Success("\tTutorial bot discrimination...");

          var tutorialBot = duplicate.Value.First(tank => tank.Id.EndsWith("TU"));
          tutorialBot.Slug += "-tu";
        }
        else
        {
          PrettyLog.Success("\tNation discrimination...");

          foreach (var tank in duplicate.Value)
          {
            var match = Regex.Match(tank.Id, @"([a-zA-Z]+)\d+_");
            var rawNation = match.Groups[1].Value;
            var slugNation = rawNation.ToLowerInvariant();
            tank.Slug += $"-{slugNation}";
          }
        }

        foreach (var tank in duplicate.Value)
        {
          Console.WriteLine($"\t\t{tank.Slug}");
        }

        Console.WriteLine();
      }
    }

    Tank MangleTank(VFS tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = provider.LoadObject($"{tankDir.Path}/{pdaName}.{pdaName}");

      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;

      var name = GetString($"TankEntity__{id.ToLowerInvariant()}__Short_Name");

      var slug = Diacritics.Remove(name.Locales["en"]).ToLower();
      slug = Regex.Replace(slug, "[^a-z0-9]", "-");
      slug = Regex.Replace(slug, "--+", "-");
      slug = Regex.Replace(slug, "-$", "");

      // MangleHull(id, pda);

      Tank tank = new()
      {
        Id = id,
        Name = name,
        Slug = slug,
      };

      changes.Add(new($"definitions/tanks/{id}.pb", tank.ToByteArray()));

      return tank;
    }

    void MangleHull(string tankId, UObject pda)
    {
      var hulls = PropertyUtil.Get<UDataTable>(pda, "DT_Hulls");
      UDataTableUtility.TryGetDataTableRow(hulls, "hull", StringComparison.Ordinal, out var hull);
      var hullVisualData = PropertyUtil.Get<UObject>(hull, "VisualData");
      var hullMeshSettings = PropertyUtil.Get<FStructFallback>(hullVisualData, "MeshSettings");
      var hullCollision = PropertyUtil.Get<UStaticMesh>(hullMeshSettings, "CollisionMesh");
      MonoGltf hullCollisionGltf = new(hullCollision);

      changes.Add(new($"tanks/{tankId}/collision/hull.glb", hullCollisionGltf.Write()));
    }
  }
}
