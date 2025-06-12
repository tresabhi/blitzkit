using System.Text;
using CUE4Parse.FileProvider.Objects;
using IniParser.Model;
using IniParser.Model.Configuration;
using IniParser.Parser;

namespace BlitzKit.FFI.Utils
{
  public class INIAccessor
  {
    private static readonly IniParserConfiguration configuration = new()
    {
      AllowDuplicateSections = true,
      AllowDuplicateKeys = true,
      ConcatenateDuplicateKeys = true,
    };

    private readonly IniData data;

    public INIAccessor(GameFile file)
    {
      var bytes = file.Read();
      var str = Encoding.UTF8.GetString(bytes);
      IniDataParser parser = new(configuration);
      data = parser.Parse(str);
    }

    public KeyDataCollection this[string sectionName] => data[sectionName];
  }
}
