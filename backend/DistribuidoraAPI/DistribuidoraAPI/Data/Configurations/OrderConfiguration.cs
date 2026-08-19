using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DistribuidoraAPI.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.Number)
            .HasColumnName("number")
            .IsRequired();

        builder.HasIndex(o => o.Number)
            .IsUnique();

        builder.Property(o => o.CustomerId)
            .HasColumnName("customer_id")
            .IsRequired();

        builder.Property(o => o.UserId)
            .HasColumnName("seller_id")
            .IsRequired();

        builder.Property(o => o.PaymentMethodId)
            .HasColumnName("payment_method_id")
            .IsRequired();

        builder.Property(o => o.Date)
            .HasColumnName("date")
            .IsRequired();

        builder.Property(o => o.Total)
            .HasColumnName("total")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(o => o.Cancelled)
            .HasColumnName("cancelled")
            .IsRequired();

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(o => o.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired();

        builder.HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.PaymentMethod)
            .WithMany()
            .HasForeignKey(o => o.PaymentMethodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Details)
            .WithOne(d => d.Order)
            .HasForeignKey(d => d.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}