using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(sm => sm.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(sm => sm.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(sm => sm.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(sm => sm.ReferenceId)
            .HasColumnName("reference_id")
            .IsRequired();

        builder.HasOne(sm => sm.Product)
            .WithMany()
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}