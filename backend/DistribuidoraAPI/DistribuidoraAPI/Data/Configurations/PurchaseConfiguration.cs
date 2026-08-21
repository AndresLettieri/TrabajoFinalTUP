using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.ToTable("purchases");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(p => p.Number)
            .HasColumnName("number")
            .IsRequired();

        builder.HasIndex(p => new
        {
            p.VendorId,
            p.Number
        })
        .IsUnique();

        builder.Property(p => p.VendorId)
            .HasColumnName("vendor_id")
            .IsRequired();

        builder.Property(p => p.Date)
            .HasColumnName("date")
            .IsRequired();

        builder.Property(p => p.Total)
            .HasColumnName("total")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(p => p.Observations)
            .HasColumnName("observations")
            .HasMaxLength(1500)
            .IsRequired(false);

        builder.Property(p => p.Cancelled)
            .HasColumnName("cancelled")
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(p => p.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();

        builder.Property(c => c.ModifiedAt)
            .HasColumnName("modified_at")
            .IsRequired(false);

        builder.Property(c => c.ModifiedBy)
            .HasColumnName("modified_by")
            .IsRequired(false);

        builder.HasOne(p => p.Vendor)
            .WithMany()
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Details)
            .WithOne(d => d.Purchase)
            .HasForeignKey(d => d.PurchaseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}