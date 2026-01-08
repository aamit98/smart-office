using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace ResourceService.Api.Models;

public class Asset 
{
    [BsonId] // special id string - MongoDB attribute 
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty; 
    public string Type { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public string Description { get; set; } = string.Empty;
    public string? BookedBy { get; set; } // Stores User ID
    public string? BookedByFullName { get; set; } // Stores User Full Name
}