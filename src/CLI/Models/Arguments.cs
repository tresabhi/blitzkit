namespace CLI.Models
{
  public class Arguments
  {
    public string[] raw;
    public bool sanitize;

    public Arguments(string[] args)
    {
      raw = args;
      sanitize = args.Contains("--sanitize");

      if (args.Length < 1)
      {
        throw new ArgumentException("No arguments provided");
      }
    }
  }
}
