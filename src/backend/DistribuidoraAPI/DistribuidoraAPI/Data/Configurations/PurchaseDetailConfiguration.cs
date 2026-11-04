using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class PurchaseDetailConfiguration : IEntityTypeConfiguration<PurchaseDetail>
{
    public void Configure(EntityTypeBuilder<PurchaseDetail> builder)
    {
        builder.ToTable("purchase_details");

        builder.HasKey(pd => pd.Id);

        builder.Property(pd => pd.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(pd => pd.PurchaseId)
            .HasColumnName("purchase_id")
            .IsRequired();

        builder.Property(pd => pd.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(pd => pd.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(pd => pd.PurchasePrice)
            .HasColumnName("purchase_price")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(pd => pd.Subtotal)
            .HasColumnName("subtotal")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.HasIndex(pd => new
        {
            pd.PurchaseId,
            pd.ProductId
        })
        .IsUnique();

        builder.HasOne(pd => pd.Purchase)
            .WithMany(p => p.Details)
            .HasForeignKey(pd => pd.PurchaseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pd => pd.Product)
            .WithMany()
            .HasForeignKey(pd => pd.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}