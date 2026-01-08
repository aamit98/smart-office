using MongoDB.Driver;
using ResourceService.Api.Models;

namespace ResourceService.Api.Services;

public class DbSeeder
{
    private readonly IMongoCollection<Asset> _assets;

    public DbSeeder(IConfiguration config)
    {
        var mongoUrl = MongoUrl.Create(config.GetConnectionString("MongoConnection"));
        var client = new MongoClient(mongoUrl);
        var database = client.GetDatabase("SmartOfficeAssetsDB"); // Must match AssetsService!
        _assets = database.GetCollection<Asset>("Assets");
    }

    public async Task SeedAsync()
    {
        // Ensure consistent data state for development and demonstration environments.
        // Warning: This operation resets the Asset collection. Do not enable in production without modification.
        var count = await _assets.CountDocumentsAsync(_ => true);
        if (count > 0) 
        {
             // Reset collection to apply the latest seed data schema and values.
             await _assets.DeleteManyAsync(_ => true);
        }

        var demoAssets = new List<Asset>
        {
            // === MEETINGS ROOMS (High Demand) ===
            new Asset { Name = "Boardroom Alpha", Type = "Room", Description = "Executive meeting room, 20 seats, 4K Video.", IsAvailable = true },
            new Asset 
            { 
                Name = "Creative Lab (Glass)", Type = "Room", Description = "Wall-to-wall whiteboards. Soundproof.", 
                IsAvailable = false, BookedBy = "u1", BookedByFullName = "David Miller" 
            },
            new Asset { Name = "Quiet Pod A", Type = "Room", Description = "Single-person booth.", IsAvailable = true },
            new Asset { Name = "Quiet Pod B", Type = "Room", Description = "Single-person booth.", IsAvailable = true },
            new Asset 
            { 
                Name = "Lecture Hall B", Type = "Room", Description = "Training room with projector. Capacity: 50.", 
                IsAvailable = false, BookedBy = "u2", BookedByFullName = "Jessica Pearson" 
            },

            // === DESKS (Hot Seating) ===
            new Asset { Name = "Hot Desk 101", Type = "Desk", Description = "Window seat, dual monitor.", IsAvailable = true },
            new Asset 
            { 
                Name = "Hot Desk 102", Type = "Desk", Description = "Standard workstation.", 
                IsAvailable = false, BookedBy = "u3", BookedByFullName = "Joey Tribbiani"
            },
            new Asset { Name = "Hot Desk 103", Type = "Desk", Description = "Standing desk.", IsAvailable = true },
            new Asset { Name = "Hot Desk 104", Type = "Desk", Description = "Near kitchen.", IsAvailable = true },
            new Asset 
            { 
                Name = "Hot Desk 105", Type = "Desk", Description = "Quiet zone.", 
                IsAvailable = false, BookedBy = "u4", BookedByFullName = "Rachel Green"
            },
            new Asset 
            { 
                Name = "Lead Dev Station", Type = "Desk", Description = "High-performance Linux rig.", 
                IsAvailable = false, BookedBy = "u5", BookedByFullName = "Chandler Bing"
            },
            new Asset { Name = "Intern Desk A", Type = "Desk", Description = "Basic setup.", IsAvailable = true },
            new Asset { Name = "Intern Desk B", Type = "Desk", Description = "Basic setup.", IsAvailable = true },

            // === LAPTOPS & EQUIPMENT ===
            new Asset { Name = "MacBook Pro 16", Type = "Laptop", Description = "M3 Max, 64GB RAM.", IsAvailable = true },
            new Asset { Name = "Dell XPS 15", Type = "Laptop", Description = "Windows 11, i9.", IsAvailable = true },
            new Asset 
            { 
                Name = "Lenovo ThinkPad X1", Type = "Laptop", Description = "Lightweight ultrabook.", 
                IsAvailable = false, BookedBy = "u6", BookedByFullName = "Ross Geller"
            },
            new Asset { Name = "iPad Pro 12.9", Type = "Laptop", Description = "For design reviews.", IsAvailable = true },
            new Asset { Name = "4K Portable Projector", Type = "Projector", Description = "Wireless presentation.", IsAvailable = true },
            new Asset { Name = "VR Headset Set", Type = "Equipment", Description = "Oculus Quest 3 for demo.", IsAvailable = true },

            // === PARKING ===
            new Asset { Name = "P-101 (Guest)", Type = "Parking", Description = "Level -1, near elevator.", IsAvailable = true },
            new Asset { Name = "P-102 (Director)", Type = "Parking", Description = "Reserved.", IsAvailable = false, BookedBy = "manual", BookedByFullName = "Monica Geller" },
            new Asset { Name = "P-103", Type = "Parking", Description = "Standard spot.", IsAvailable = true },
            new Asset { Name = "P-104", Type = "Parking", Description = "Standard spot.", IsAvailable = true },
            new Asset { Name = "P-105 (EV)", Type = "Parking", Description = "Electric Charger available.", IsAvailable = true },
            
            // === LAB EQUIPMENT ===
            new Asset { Name = "3D Printer", Type = "Equipment", Description = "Prusa MK4.", IsAvailable = true },
            new Asset { Name = "Oscilloscope", Type = "Equipment", Description = "Digital storage.", IsAvailable = false, BookedBy = "u7", BookedByFullName = "Mike Hannigan" }
        };

        await _assets.InsertManyAsync(demoAssets);
    }
}
