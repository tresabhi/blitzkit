using System.Globalization;
using System.Text;

namespace BlitzKit.CLI.Utils
{
  public static class Diacritics
  {
    public static string Remove(string text)
    {
      var normalizedString = text.Normalize(NormalizationForm.FormD);
      var stringBuilder = new StringBuilder(capacity: normalizedString.Length);

      for (int i = 0; i < normalizedString.Length; i++)
      {
        char c = normalizedString[i];
        var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
        if (unicodeCategory != UnicodeCategory.NonSpacingMark)
        {
          stringBuilder.Append(c);
        }
      }

      return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
  }
}
