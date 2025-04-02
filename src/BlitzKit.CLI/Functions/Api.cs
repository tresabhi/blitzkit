using System.Threading.Tasks;
using AssetRipper.TextureDecoder.Rgb.Channels;
using Blitzkit;
using Google.Protobuf;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace BlitzKit.CLI.Functions
{
  public class Api(string[] args)
  {
    readonly WebApplication app = WebApplication.Create();
    readonly Mangler mangler = new(args);

    void Map<T>(string path, Func<Task<T>> func)
      where T : IMessage<T> =>
      app.MapGet(path, async context => await Octet(context, await func()));

    void Map<T>(string path, Func<T> func)
      where T : IMessage<T> => Map(path, () => Task.FromResult(func()));

    static async Task Octet<T>(HttpContext context, T message)
      where T : IMessage<T>
    {
      var bytes = message.ToByteArray();

      context.Response.ContentType = "application/octet-stream";
      await context.Response.Body.WriteAsync(bytes);
    }

    public async Task Run()
    {
      await mangler.Initialize();

      Map("/tanks/full.pb", mangler.TanksFull);
      Map("/tanks/list.pb", mangler.Tanks);

      app.MapGet(
        "/tanks/{id}.pb",
        (HttpContext context, string id) => Octet(context, mangler.Tank(id))
      );

      app.MapGet(
        "/tanks/{id}/icons/big.pb",
        (HttpContext context, string id) => Octet(context, mangler.TankIconBig(id))
      );

      app.Run();
    }
  }
}
