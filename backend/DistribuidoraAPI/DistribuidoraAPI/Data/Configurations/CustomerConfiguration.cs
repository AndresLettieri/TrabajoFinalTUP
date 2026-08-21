using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(c => c.Document)
            .HasColumnName("document")
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(c => c.Document)
            .IsUnique();

        builder.Property(c => c.Phone)
            .HasColumnName("phone")
            .HasMaxLength(30)
            .IsRequired(false);

        builder.Property(c => c.Email)
            .HasColumnName("email")
            .HasMaxLength(150)
            .IsRequired(false);

        builder.Property(c => c.Address)
            .HasColumnName("address")
            .HasMaxLength(250)
            .IsRequired(false);

        builder.Property(c => c.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(c => c.Observations)
            .HasColumnName("observations")
            .HasMaxLength(1500)
            .IsRequired(false);

        builder.Property(c => c.Active)
            .HasColumnName("active")
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(c => c.CreatedBy)
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