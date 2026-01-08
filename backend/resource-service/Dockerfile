
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ResourceService.Api/ResourceService.Api.csproj", "ResourceService.Api/"]
RUN dotnet restore "ResourceService.Api/ResourceService.Api.csproj"
COPY . .
WORKDIR "/src/ResourceService.Api"
RUN dotnet build "ResourceService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResourceService.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ResourceService.Api.dll"]