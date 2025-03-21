namespace BlitzKit.CLI.Utils
{
  public static class PrettyLog
  {
    public static void Log(string message)
    {
      Console.WriteLine($"[INFO] {message}");
    }

    public static void Warn(string message)
    {
      Console.ForegroundColor = ConsoleColor.Yellow;
      Console.WriteLine($"[WARN] {message}");
      Console.ResetColor();
    }

    public static void Error(string message)
    {
      Console.ForegroundColor = ConsoleColor.Red;
      Console.WriteLine($"[EROR] {message}");
      Console.ResetColor();
    }

    public static void Success(string message)
    {
      Console.ForegroundColor = ConsoleColor.Green;
      Console.WriteLine($"[OKAY] {message}");
      Console.ResetColor();
    }

    public static void Background(string message)
    {
      Console.ForegroundColor = ConsoleColor.DarkGray;
      Console.WriteLine($"[BACK] {message}");
      Console.ResetColor();
    }

    public static void Line()
    {
      Console.WriteLine();
    }
  }
}
