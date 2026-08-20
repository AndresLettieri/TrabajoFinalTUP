using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("vendors");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(v => v.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(v => v.Phone)
            .HasColumnName("phone")
            .HasMaxLength(30)
            .IsRequired(false);

        builder.Property(v => v.Email)
            .HasColumnName("email")
            .HasMaxLength(150)
            .IsRequired(false);

        builder.Property(v => v.Address)
            .HasColumnName("address")
            .HasMaxLength(250)
            .IsRequired(false);

        builder.Property(v => v.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(v => v.Observations)
            .HasColumnName("observations")
            .HasMaxLength(1500)
            .IsRequired(false);

        builder.Property(v => v.Active)
            .HasColumnName("active")
            .IsRequired();

        builder.Property(v => v.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(v => v.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();

        builder.Property(c => c.ModifiedAt)
            .HasColumnName("modified_at")
            .IsRequired(false);

        builder.Property(c => c.ModifiedBy)
            .HasColumnName("modified_by")
            .IsRequired(false);
    }
}