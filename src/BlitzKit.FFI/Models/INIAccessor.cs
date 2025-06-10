using System.Collections.Generic;
using System.Linq;

namespace BlitzKit.FFI.Models
{
  public class INIAccessor
  {
    private Dictionary<string, object> data = [];

    public INIAccessor(string content)
    {
      var lines = content.Split(['\n', '\r'], System.StringSplitOptions.RemoveEmptyEntries);

      foreach (var line in lines)
      {
        var trimmed = line.Trim();

        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith(';'))
          continue;

        var prefix = trimmed[0];
        string key,
          value;

        if (prefix == '+' || prefix == '-')
        {
          var x = trimmed.IndexOf('=');
          key = trimmed[1..x];
          value = trimmed[(x + 1)..];

          if (!data.TryGetValue(key, out var existing))
          {
            data[key] = existing = new List<string>();
          }

          var list = (List<string>)existing;

          if (prefix == '+')
            list.Add(value);
          else
            list.Remove(value);
        }
        else
        {
          var x = trimmed.IndexOf('=');
          key = trimmed[..x];
          value = trimmed[(x + 1)..];

          data[key] = value;
        }
      }
    }

    public bool TryGet(string key, out object value) => data.TryGetValue(key, out value);

    public object Get(string key) => data[key];
  }
}
