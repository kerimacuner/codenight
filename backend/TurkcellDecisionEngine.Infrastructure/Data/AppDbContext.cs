using Microsoft.EntityFrameworkCore;
using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<UserState> UserStates { get; set; }
    public DbSet<Rule> Rules { get; set; }
    public DbSet<UserAction> Actions { get; set; }
    public DbSet<Decision> Decisions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(200);
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(20);
        });

        // Event configuration
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.Property(e => e.EventId).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.Service).HasMaxLength(50);
            entity.Property(e => e.EventType).HasMaxLength(50);
            entity.Property(e => e.Value).HasPrecision(18, 4);
            entity.Property(e => e.Unit).HasMaxLength(20);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.Events)
                .HasForeignKey(e => e.UserId);

            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.UserId);
        });

        // UserState configuration
        modelBuilder.Entity<UserState>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.InternetTodayGb).HasPrecision(18, 4);
            entity.Property(e => e.SpendTodayTry).HasPrecision(18, 4);
            entity.Property(e => e.RiskLevel).HasConversion<string>().HasMaxLength(20);

            entity.HasOne(e => e.User)
                .WithOne(u => u.UserState)
                .HasForeignKey<UserState>(e => e.UserId);
        });

        // Rule configuration
        modelBuilder.Entity<Rule>(entity =>
        {
            entity.HasKey(e => e.RuleId);
            entity.Property(e => e.RuleId).HasMaxLength(50);
            entity.Property(e => e.Condition).HasMaxLength(500);
            entity.Property(e => e.Action).HasMaxLength(50);

            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Priority);
        });

        // UserAction configuration
        modelBuilder.Entity<UserAction>(entity =>
        {
            entity.HasKey(e => e.ActionId);
            entity.Property(e => e.ActionId).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.ActionType).HasMaxLength(50);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Actions)
                .HasForeignKey(e => e.UserId);

            entity.HasIndex(e => e.CreatedAt);
        });

        // Decision configuration
        modelBuilder.Entity<Decision>(entity =>
        {
            entity.HasKey(e => e.DecisionId);
            entity.Property(e => e.DecisionId).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.TriggeredRules).HasMaxLength(1000);
            entity.Property(e => e.SelectedAction).HasMaxLength(50);
            entity.Property(e => e.SuppressedActions).HasMaxLength(1000);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Decisions)
                .HasForeignKey(e => e.UserId);

            entity.HasIndex(e => e.Timestamp);
        });

        // Note: Seed data is loaded from CSV files via CsvSeedDataLoader
    }
}
