namespace BlitzKit.CLI.Utils
{
  public static class PrettyLog
  {
    private static void Write(string prefix, string message, ConsoleColor color)
    {
      Console.ForegroundColor = color;
      Console.WriteLine($"[{prefix}] {message}");
      Console.ResetColor();
    }

    public static void Log(string message) => Write("INFO", message, ConsoleColor.White);

    public static void Warn(string message) => Write("WARN", message, ConsoleColor.Yellow);

    public static void Error(string message) => Write("ERRR", message, ConsoleColor.Red);

    public static void Success(string message) => Write("OKAY", message, ConsoleColor.Green);

    public static void Background(string message) => Write("BACK", message, ConsoleColor.DarkGray);

    public static void Line() => Console.WriteLine();
  }
}
