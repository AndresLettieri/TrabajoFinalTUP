using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class OrderDetailConfiguration : IEntityTypeConfiguration<OrderDetail>
{
    public void Configure(EntityTypeBuilder<OrderDetail> builder)
    {
        builder.ToTable("order_details");

        builder.HasKey(od => od.Id);

        builder.Property(od => od.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(od => od.OrderId)
            .HasColumnName("order_id")
            .IsRequired();

        builder.Property(od => od.ProductId)
            .HasColumnName("product_id")
            .IsRequired();

        builder.Property(od => od.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(od => od.SalePrice)
            .HasColumnName("sale_price")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(od => od.PurchasePrice)
            .HasColumnName("purchase_price")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(od => od.Subtotal)
            .HasColumnName("subtotal")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.HasIndex(od => new
        {
            od.OrderId,
            od.ProductId
        })
        .IsUnique();

        builder.HasOne(od => od.Order)
            .WithMany(o => o.Details)
            .HasForeignKey(od => od.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(od => od.Product)
            .WithMany()
            .HasForeignKey(od => od.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}