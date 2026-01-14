using Microsoft.EntityFrameworkCore;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Enums;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class UserStateManager : IUserStateManager
{
    private readonly AppDbContext _context;

    public UserStateManager(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserState> GetOrCreateUserStateAsync(string userId)
    {
        var userState = await _context.UserStates.FindAsync(userId);
        
        if (userState == null)
        {
            userState = new UserState
            {
                UserId = userId,
                InternetTodayGb = 0,
                SpendTodayTry = 0,
                ContentMinutesToday = 0,
                RiskLevel = RiskLevel.LOW,
                LastUpdated = DateTime.UtcNow
            };
            
            _context.UserStates.Add(userState);
            await _context.SaveChangesAsync();
        }
        
        return userState;
    }

    public async Task<UserState> UpdateUserStateAsync(string userId, Event evt)
    {
        var userState = await GetOrCreateUserStateAsync(userId);
        
        // Reset daily values if it's a new day
        if (userState.LastUpdated.Date < DateTime.UtcNow.Date)
        {
            userState.InternetTodayGb = 0;
            userState.SpendTodayTry = 0;
            userState.ContentMinutesToday = 0;
        }
        
        // Update state based on event type and service
        switch (evt.Service.ToUpperInvariant())
        {
            case "INTERNET":
            case "DATA":
            case "SUPERONLINE":
                if (evt.Unit.ToUpperInvariant() == "GB" || evt.Unit.ToUpperInvariant() == "MB")
                {
                    var gbValue = evt.Unit.ToUpperInvariant() == "MB" ? evt.Value / 1024 : evt.Value;
                    userState.InternetTodayGb += gbValue;
                }
                break;
                
            case "PAYCELL":
            case "PAYMENT":
                if (evt.Unit.ToUpperInvariant() == "TRY" || evt.Unit.ToUpperInvariant() == "TL")
                {
                    userState.SpendTodayTry += evt.Value;
                }
                break;
                
            case "TV+":
            case "TVPLUS":
            case "CONTENT":
            case "FIZY":
            case "BIPLIVE":
            case "GAME+":
            case "GAMEPLUS":
                if (evt.Unit.ToUpperInvariant() == "MIN" || evt.Unit.ToUpperInvariant() == "MINUTES")
                {
                    userState.ContentMinutesToday += (int)evt.Value;
                }
                break;
        }
        
        // Calculate risk level
        userState.RiskLevel = CalculateRiskLevel(userState);
        userState.LastUpdated = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return userState;
    }

    public async Task<IEnumerable<UserState>> GetAllUserStatesAsync()
    {
        return await _context.UserStates
            .Include(us => us.User)
            .OrderByDescending(us => us.RiskLevel)
            .ThenByDescending(us => us.LastUpdated)
            .ToListAsync();
    }

    public async Task ResetDailyStatesAsync()
    {
        var states = await _context.UserStates.ToListAsync();
        
        foreach (var state in states)
        {
            state.InternetTodayGb = 0;
            state.SpendTodayTry = 0;
            state.ContentMinutesToday = 0;
            state.RiskLevel = RiskLevel.LOW;
            state.LastUpdated = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
    }

    private RiskLevel CalculateRiskLevel(UserState state)
    {
        int riskScore = 0;
        
        // Internet usage scoring
        if (state.InternetTodayGb > 20) riskScore += 3;
        else if (state.InternetTodayGb > 15) riskScore += 2;
        else if (state.InternetTodayGb > 10) riskScore += 1;
        
        // Spending scoring
        if (state.SpendTodayTry > 400) riskScore += 3;
        else if (state.SpendTodayTry > 300) riskScore += 2;
        else if (state.SpendTodayTry > 200) riskScore += 1;
        
        // Content consumption scoring
        if (state.ContentMinutesToday > 240) riskScore += 2;
        else if (state.ContentMinutesToday > 180) riskScore += 1;
        
        return riskScore switch
        {
            >= 6 => RiskLevel.CRITICAL,
            >= 4 => RiskLevel.HIGH,
            >= 2 => RiskLevel.MEDIUM,
            _ => RiskLevel.LOW
        };
    }
}
