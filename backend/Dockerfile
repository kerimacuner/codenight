# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY TurkcellDecisionEngine.Core/TurkcellDecisionEngine.Core.csproj TurkcellDecisionEngine.Core/
COPY TurkcellDecisionEngine.Infrastructure/TurkcellDecisionEngine.Infrastructure.csproj TurkcellDecisionEngine.Infrastructure/
COPY TurkcellDecisionEngine.Api/TurkcellDecisionEngine.Api.csproj TurkcellDecisionEngine.Api/

RUN dotnet restore TurkcellDecisionEngine.Api/TurkcellDecisionEngine.Api.csproj

# Copy everything and build
COPY . .
RUN dotnet publish TurkcellDecisionEngine.Api/TurkcellDecisionEngine.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TurkcellDecisionEngine.Api.dll"]
