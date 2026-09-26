using DistribuidoraAPI.DTOs.Vendor;

namespace DistribuidoraAPI.Services;

public interface IVendorService
{
    Task<IEnumerable<VendorResponseDto>> GetAll();
    Task<VendorResponseDto> GetById(int id);
    Task<VendorResponseDto> Create(CreateVendorRequest request);
    Task<VendorResponseDto> Update(int id, UpdateVendorRequest request);
    Task Delete(int id, int userId);
}
