namespace BlitzKit.CLI.Models
{
  public class GLB
  {
    public GLB(MappedUObject obj)
    {
      var staticMaterials = obj.GetArray("StaticMaterials");

      foreach (var staticMaterial in staticMaterials)
      {
        Console.WriteLine(staticMaterial.GetAny("MaterialInterface"));
      }
    }
  }
}
