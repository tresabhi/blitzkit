using Google.Protobuf;
using Microsoft.AspNetCore.Builder;

namespace BlitzKit.CLI.Functions
{
  public class Api(string[] args)
  {
    readonly WebApplication app = WebApplication.Create();
    readonly Mangler mangler = new(args);

    void Map<T>(string path, Func<Task<T>> func)
      where T : IMessage<T>
    {
      app.MapGet(
        path,
        async (context) =>
        {
          var message = await func();
          var bytes = message.ToByteArray();

          context.Response.ContentType = "application/octet-stream";
          await context.Response.Body.WriteAsync(bytes);
        }
      );
    }

    public async Task Run()
    {
      await mangler.Initialize();

      Map("/tanks/full.pb", mangler.TanksFull);
      Map("/tanks/list.pb", mangler.Tanks);

      app.Run();
    }
  }
}
