namespace BlitzKit.CLI.Utils
{
  public class IniParser
  {
    private readonly Dictionary<string, string> strings = [];
    private readonly Dictionary<string, List<string>> arrays = [];

    public IniParser(string file)
    {
      string content = File.ReadAllText(file);

      foreach (string line in content.Split('\n'))
      {
        if (string.IsNullOrWhiteSpace(line))
          continue;

        string[] parts = line.Split('=');
        if (parts.Length < 2)
          continue;

        string key = parts[0].Trim();
        string value = string.Join("=", parts, 1, parts.Length - 1).Trim();

        if (key.StartsWith('+'))
        {
          string keySuffix = key[1..];

          if (arrays.TryGetValue(keySuffix, out List<string>? listValue))
          {
            listValue.Add(value);
          }
          else
          {
            arrays[keySuffix] = [value];
          }
        }
        else
        {
          // Overwrite existing key instead of throwing an exception
          strings[key] = value;
        }
      }
    }

    public string? GetString(string key) =>
      strings.TryGetValue(key, out string? value) ? value : null;

    public List<string>? GetArray(string key) =>
      arrays.TryGetValue(key, out List<string>? value) ? value : null;
  }
}
