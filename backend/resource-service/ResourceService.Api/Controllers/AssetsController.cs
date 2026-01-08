using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResourceService.Api.Models;
using ResourceService.Api.Services;

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
    //Everyone can view assets
    [HttpGet]
    public async Task<List<Asset>> Get() =>
        await _assetsService.GetAsync();

    // POST: api/assets
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Asset newAsset)
    {
        await _assetsService.CreateAsync(newAsset);
        return CreatedAtAction(nameof(Get), new { id = newAsset.Id }, newAsset);
    }
}