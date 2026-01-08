using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResourceService.Api.Models;
using ResourceService.Api.Services;
using System.Security.Claims;

namespace ResourceService.Api.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly AssetsService _assetsService;

    public AssetsController(AssetsService assetsService)
    {
        _assetsService = assetsService;
    }

    // GET: api/assets
    // Retrieves a paginated list of assets. Accessible to all authenticated users.
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 12,
        [FromQuery] bool? isAvailable = null)
    {
        // Enforce pagination constraints
        if (page < 1) page = 1; 
        if (pageSize < 1) pageSize = 12; 
        if (pageSize > 100) pageSize = 100;
        
        var result = await _assetsService.GetPaginatedAsync(page, pageSize, isAvailable);
        return Ok(result);
    }

    [HttpGet("{id:length(24)}")]
    public async Task<IActionResult> Get(string id)
    {
        var asset = await _assetsService.GetAsync(id);

        if (asset is null)
        {
            return NotFound();
        }

        return Ok(asset);
    }

    // GET: api/assets/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _assetsService.GetStatsAsync();
        return Ok(stats);
    }

    // POST: api/assets
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Asset newAsset)
    {
        await _assetsService.CreateAsync(newAsset);
        return CreatedAtAction(nameof(Get), new { id = newAsset.Id }, newAsset);
    }

    // PUT: api/assets/{id}
    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, [FromBody] Asset updatedAsset)
    {
        var asset = await _assetsService.GetAsync(id);

        if (asset is null)
        {
            return NotFound();
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var fullName = User.FindFirst("FullName")?.Value ?? "Unknown User";
        var isAdmin = User.IsInRole("Admin");

        // Handle state transitions (Booking vs Releasing)
        if (asset.IsAvailable && !updatedAsset.IsAvailable) 
        {
            // Asset is being booked: Assign current user as owner
            updatedAsset.BookedBy = userId; 
            updatedAsset.BookedByFullName = fullName;
        }
        else if (!asset.IsAvailable && updatedAsset.IsAvailable)
        {
            // Asset is being released: Verify ownership or Admin privileges
            if (asset.BookedBy != userId && !isAdmin && !string.IsNullOrEmpty(asset.BookedBy))
            {
                // User is not authorized to release this asset
                return Forbid();
            }
            updatedAsset.BookedBy = null; 
            updatedAsset.BookedByFullName = null;
        }
        else 
        {
            // No state change detected. Preserve existing ownership unless explicitly modified by Admin.
             if (!isAdmin) {
                 updatedAsset.BookedBy = asset.BookedBy; 
                 updatedAsset.BookedByFullName = asset.BookedByFullName;
             }
        }

        updatedAsset.Id = asset.Id;

        await _assetsService.UpdateAsync(id, updatedAsset);

        return NoContent();
    }

    // DELETE: api/assets/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var asset = await _assetsService.GetAsync(id);

        if (asset is null)
        {
            return NotFound();
        }

        await _assetsService.RemoveAsync(id);

        return NoContent();
    }
}