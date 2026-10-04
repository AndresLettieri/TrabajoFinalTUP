using DistribuidoraAPI.Data;
using Microsoft.EntityFrameworkCore.Storage;
using DistribuidoraAPI.Repositories.Implementations;

namespace DistribuidoraAPI.Repositories;


public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IBrandRepository? _brandRepository;
    private ICategoryRepository? _categoryRepository;
    private ICustomerRepository? _customerRepository;
    private IPaymentMethodRepository? _paymentMethodRepository;
    private IProductRepository? _productRepository;
    private IPurchaseRepository? _purchaseRepository;
    private IVendorRepository? _vendorRepository;
    private IUserRepository? _userRepository;

    private IDbContextTransaction? _transaction;
    private readonly Dictionary<Type, object> _repositories = new();

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public ICategoryRepository Categories
    {
        get
        {
            if (_categoryRepository == null)
            {
                _categoryRepository = new CategoryRepository(_context);
            }
            return _categoryRepository;
        }
    }

    public IBrandRepository Brands
    {
        get
        {
            if (_brandRepository == null)
            {
                _brandRepository = new BrandRepository(_context);
            }
            return _brandRepository;
        }
    }

    public ICustomerRepository Customers
    {
        get
        {
            if (_customerRepository == null)
            {
                _customerRepository = new CustomerRepository(_context);
            }
            return _customerRepository;
        }
    }

    public IVendorRepository Vendors
    {
        get
        {
            if (_vendorRepository == null)
            {
                _vendorRepository = new VendorRepository(_context);
            }
            return _vendorRepository;
        }
    }

    public IPaymentMethodRepository PaymentMethods
    {
        get
        {
            if (_paymentMethodRepository == null)
            {
                _paymentMethodRepository = new PaymentMethodRepository(_context);
            }
            return _paymentMethodRepository;
        }
    }

    public IProductRepository Products
    {
        get
        {
            if (_productRepository == null)
            {
                _productRepository = new ProductRepository(_context);
            }
            return _productRepository;
        }
    }

    public IPurchaseRepository Purchases
    {
        get
        {
            if (_purchaseRepository == null)
            {
                _purchaseRepository = new PurchaseRepository(_context);
            }
            return _purchaseRepository;
        }
    }

    public IUserRepository Users
    {
        get
        {
            if (_userRepository == null)
            {
                _userRepository = new UserRepository(_context);
            }
            return _userRepository;
        }
    }

    public IRepository<T> GetRepository<T>() where T : class
    {
        Type type = typeof(T);
        if (!_repositories.ContainsKey(type))
        {
            var repositoryType = typeof(RepositoryBase<>).MakeGenericType(type);
            var repositoryInstance = Activator.CreateInstance(repositoryType, _context);
            _repositories.Add(type, repositoryInstance!);
        }
        return (IRepository<T>)_repositories[type];
    }

    public async Task<int> SaveChanges()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransaction()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }
    public async Task Commit()
    {
        try
        {
            await SaveChanges();
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await Rollback();
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task Rollback()
    {
        try
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
            }
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context?.Dispose();
        GC.SuppressFinalize(this);
    }
}
