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
            // === LOCATIONS & ROOMS ===
            new Asset 
            { 
                Name = "S11 Conference Hall", 
                Type = "Room", 
                Description = "Main conference room for B1 format presentations. Located in Rehovot HQ Building A.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Nanography Think Tank", 
                Type = "Room", 
                Description = "Creative space for R&D. Features whiteboard walls and 7-color ambient lighting. Reserved for Innovation Team.", 
                IsAvailable = false,
                BookedBy = "user_benny_id_placeholder" 
            },
            new Asset 
            { 
                Name = "Sittard Video Link", 
                Type = "Room", 
                Description = "High-definition video conference suite optimized for calls with the European manufacturing site.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Cust. Exp. Center (Lobby)", 
                Type = "Room", 
                Description = "Welcome area for VIP customer demonstrations. Includes S10 samples display.", 
                IsAvailable = true 
            },
             new Asset 
            { 
                Name = "Quiet Focus Room 302", 
                Type = "Room", 
                Description = "Soundproof booth for deep work or private calls. Building B, 3rd Floor.", 
                IsAvailable = true 
            },

            // === SPECIALIZED LABS ===
            new Asset 
            { 
                Name = "NanoInk Formulation Lab", 
                Type = "Lab", 
                Description = "Restricted Access. Equipped for aqueous pigment dispersion testing.", 
                IsAvailable = false,
                BookedBy = "chief_chemist_id"
            },
            new Asset 
            { 
                Name = "Substrate Compatibility Lab", 
                Type = "Lab", 
                Description = "Testing facility for paper, plastic, and cartonboard compatibility with Nanography.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Print Quality QA Station", 
                Type = "Lab", 
                Description = "Microscope and densitometer setup for inspecting droplet placement accuracy.", 
                IsAvailable = true 
            },

            // === WORKSTATIONS ===
            new Asset 
            { 
                Name = "R&D Desk - Chemistry Lead", 
                Type = "Desk", 
                Description = "Dedicated workstation near the formulation lab.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Print Inspector Station 4", 
                Type = "Desk", 
                Description = "High-res monitor Setup for quality assurance of S11P prints.", 
                IsAvailable = false,
                BookedBy = "qa_lead_id"
            },
             new Asset 
            { 
                Name = "Folding Carton Design Station", 
                Type = "Desk", 
                Description = "Equipped with CAD tools for packaging structural design.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Hot Desk - Sales Float", 
                Type = "Desk", 
                Description = "Open desk for visiting sales representatives. Plug & Play monitors.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Intern Cluster - Desk 1", 
                Type = "Desk", 
                Description = "Workstation allocated for summer engineering interns.", 
                IsAvailable = true 
            },

             // === HIGH-TECH PRINTERS & MACHINES ===
             new Asset 
            { 
                Name = "S11P Prototype (Beta)", 
                Type = "Printer", 
                Description = "Double-sided B1 printing unit for internal testing. Handle with care. Status: Online.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Office Plotter - Wide Format", 
                Type = "Printer", 
                Description = "For printing architectural plans and large engineering schematics.", 
                IsAvailable = false,
                BookedBy = "engineer_danny"
            },
            new Asset 
            { 
                Name = "3D Printer - Rapid Prototyping", 
                Type = "Printer", 
                Description = "PolyJet printer for creating press parts and components overnight.", 
                IsAvailable = true 
            },

            // === EQUIPMENT ===
            new Asset 
            { 
                Name = "Spectrophotometer X-Rite", 
                Type = "Laptop", 
                Description = "Portable color measurement device for calibration. Must be signed out.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "Thermal Transfer Simulator", 
                Type = "Projector", 
                Description = "Simulates the heated blanket transfer process. Use for training new operators.", 
                IsAvailable = true 
            },
             new Asset 
            { 
                Name = "MacBook Pro M3 (Loaner)", 
                Type = "Laptop", 
                Description = "High-performance laptop for graphic designers. Asset Tag #LND-992.", 
                IsAvailable = true 
            },

            // === PARKING ===
            new Asset 
            { 
                Name = "Visitor Spot A1 (VIP)", 
                Type = "Parking", 
                Description = "Reserved for potential S11 customers visiting the demo center.", 
                IsAvailable = true 
            },
            new Asset 
            { 
                Name = "EV Charging Station - North", 
                Type = "Parking", 
                Description = "Fast charging for electric vehicles. Level 2 Charger.", 
                IsAvailable = false, 
                BookedBy = "eco_friendly_employee"
            },
            new Asset 
            { 
                Name = "Logistics Truck Bay", 
                Type = "Parking", 
                Description = "Loading zone for heavy machinery and ink shipments.", 
                IsAvailable = true 
            }
        };

        await _assets.InsertManyAsync(demoAssets);
    }
}
