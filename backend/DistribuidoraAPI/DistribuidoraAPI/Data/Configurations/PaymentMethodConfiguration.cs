using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.ToTable("payment_methods");

        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(pm => pm.Name)
            .HasColumnName("name")
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(pm => pm.Name)
            .IsUnique();

        builder.Property(pm => pm.Active)
            .HasColumnName("active")
            .IsRequired();

        builder.Property(pm => pm.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(pm => pm.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();
    }
}