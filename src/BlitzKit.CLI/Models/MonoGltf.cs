using System.Numerics;
using CUE4Parse_Conversion;
using CUE4Parse_Conversion.Materials;
using CUE4Parse_Conversion.Meshes;
using CUE4Parse_Conversion.Meshes.glTF;
using CUE4Parse_Conversion.Meshes.PSK;
using CUE4Parse_Conversion.Textures;
using CUE4Parse.UE4.Assets;
using CUE4Parse.UE4.Assets.Exports.Material;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Objects.Core.Math;
using CUE4Parse.UE4.Objects.Meshes;
using CUE4Parse.Utils;
using SharpGLTF.Geometry;
using SharpGLTF.Geometry.VertexTypes;
using SharpGLTF.Materials;
using SharpGLTF.Scenes;
using SharpGLTF.Schema2;

namespace BlitzKit.CLI.Models
{
  using ConfiguredMeshBuilder = MeshBuilder<
    VertexPositionNormalTangent,
    VertexColorXTextureX,
    VertexEmpty
  >;

  public class MonoGltf
  {
    public MonoGltf(UStaticMesh staticMesh)
    {
      ExporterOptions options = new() { TextureFormat = ETextureFormat.Jpeg };
      staticMesh.TryConvert(out var convertedMesh);
      SceneBuilder sceneBuilder = new(staticMesh.Name);
      var lod =
        convertedMesh.LODs.Find(lod => !lod.SkipLod) ?? throw new Exception("Failed to find lod0");

      int sectionIndex = 0;
      foreach (var section in lod.Sections.Value)
      {
        sectionIndex++;
      }

      MaterialBuilder emptyMaterial = new("empty_material");
      Dictionary<string, MaterialBuilder> namedMaterials = [];

      foreach (var section in lod.Sections.Value)
      {
        ConfiguredMeshBuilder meshBuilder = new($"{staticMesh.Name}_section_{sectionIndex}");
        MaterialBuilder materialBuilder;

        if (section.Material == null || section.MaterialName == null)
        {
          materialBuilder = emptyMaterial;
        }
        else if (namedMaterials.TryGetValue(section.MaterialName, out MaterialBuilder? value))
        {
          materialBuilder = value;
        }
        else
        {
          var materialInterface = section.Material.Load<UMaterialInterface>()!;
          MaterialExporter2 materialExporter = new(materialInterface, options);

          materialExporter.TryWriteToDir(new("../../temp"), out _, out _);

          materialBuilder = new(section.MaterialName);
        }

        var primitive = meshBuilder.UsePrimitive(materialBuilder);

        for (int faceIndex = 0; faceIndex < section.NumFaces; faceIndex++)
        {
          var wedgeIndex = new int[3];
          for (var k = 0; k < wedgeIndex.Length; k++)
          {
            wedgeIndex[k] = lod.Indices.Value[section.FirstIndex + faceIndex * 3 + k];
          }

          var vertex1 = lod.Verts[wedgeIndex[0]];
          var vertex2 = lod.Verts[wedgeIndex[1]];
          var vertex3 = lod.Verts[wedgeIndex[2]];

          var (v1, v2, v3) = PrepareTris(vertex1, vertex2, vertex3);
          var (c1, c2, c3) = PrepareUVsAndTexCoords(lod, vertex1, vertex2, vertex3, wedgeIndex);

          primitive.AddTriangle((v1, c1), (v2, c2), (v3, c3));
        }

        sceneBuilder.AddRigidMesh(meshBuilder, Matrix4x4.Identity);
      }

      var gltf2 = sceneBuilder.ToGltf2();
      var glbBytes = gltf2.WriteGLB();

      File.WriteAllBytes("../../temp/test.glb", glbBytes);
    }

    private static (
      VertexPositionNormalTangent,
      VertexPositionNormalTangent,
      VertexPositionNormalTangent
    ) PrepareTris(CMeshVertex vert1, CMeshVertex vert2, CMeshVertex vert3)
    {
      VertexPositionNormalTangent v1 = new(
        SwapYZ(vert1.Position * 0.01f),
        SwapYZAndNormalize((FVector)vert1.Normal),
        SwapYZAndNormalize((Vector4)vert1.Tangent)
      );
      VertexPositionNormalTangent v2 = new(
        SwapYZ(vert2.Position * 0.01f),
        SwapYZAndNormalize((FVector)vert2.Normal),
        SwapYZAndNormalize((Vector4)vert2.Tangent)
      );
      VertexPositionNormalTangent v3 = new(
        SwapYZ(vert3.Position * 0.01f),
        SwapYZAndNormalize((FVector)vert3.Normal),
        SwapYZAndNormalize((Vector4)vert3.Tangent)
      );

      return (v1, v2, v3);
    }

    public static FVector SwapYZ(FVector vec)
    {
      var res = new FVector(vec.X, vec.Z, vec.Y);
      return res;
    }

    public static FVector SwapYZAndNormalize(FVector vec)
    {
      var res = SwapYZ(vec);
      res.Normalize();
      return res;
    }

    public static Vector4 SwapYZAndNormalize(Vector4 vec)
    {
      return Vector4.Normalize(new Vector4(vec.X, vec.Z, vec.Y, vec.W));
    }

    public static (
      VertexColorXTextureX,
      VertexColorXTextureX,
      VertexColorXTextureX
    ) PrepareUVsAndTexCoords(
      CBaseMeshLod lod,
      CMeshVertex vert1,
      CMeshVertex vert2,
      CMeshVertex vert3,
      int[] indices
    )
    {
      return PrepareUVsAndTexCoords(
        lod.VertexColors ?? new FColor[lod.NumVerts],
        vert1,
        vert2,
        vert3,
        lod.ExtraUV.Value,
        indices
      );
    }

    public static (
      VertexColorXTextureX,
      VertexColorXTextureX,
      VertexColorXTextureX
    ) PrepareUVsAndTexCoords(
      FColor[] colors,
      CMeshVertex vert1,
      CMeshVertex vert2,
      CMeshVertex vert3,
      FMeshUVFloat[][] uvs,
      int[] indices
    )
    {
      var (uvs1, uvs2, uvs3) = PrepareUVs(vert1, vert2, vert3, uvs, indices);
      var c1 = new VertexColorXTextureX((Vector4)colors[indices[0]] / 255, uvs1);
      var c2 = new VertexColorXTextureX((Vector4)colors[indices[1]] / 255, uvs2);
      var c3 = new VertexColorXTextureX((Vector4)colors[indices[2]] / 255, uvs3);
      return (c1, c2, c3);
    }

    private static (List<Vector2>, List<Vector2>, List<Vector2>) PrepareUVs(
      CMeshVertex vert1,
      CMeshVertex vert2,
      CMeshVertex vert3,
      FMeshUVFloat[][] uvs,
      int[] indices
    )
    {
      var uvs1 = new List<Vector2>() { vert1.UV };
      var uvs2 = new List<Vector2>() { vert2.UV };
      var uvs3 = new List<Vector2>() { vert3.UV };
      foreach (var uv in uvs)
      {
        uvs1.Add(uv[indices[0]]);
        uvs2.Add(uv[indices[1]]);
        uvs3.Add(uv[indices[2]]);
      }

      return (uvs1, uvs2, uvs3);
    }
  }
}
