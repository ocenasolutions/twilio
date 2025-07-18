// Fetch and parse the African country codes CSV
async function fetchAfricanCountryCodes() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/african_country_codes-49SeueDSCReSARw53KUWMNvWJbfsyZ.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",")

    console.log("CSV Headers:", headers)
    console.log("Total countries:", lines.length - 1)

    const countries = []

    // Skip header row and parse data
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",")
      if (values.length >= 3) {
        const country = {
          sno: values[0]?.trim(),
          name: values[1]?.trim(),
          code: values[2]?.trim(),
        }

        if (country.name && country.code) {
          countries.push(country)
        }
      }
    }

    console.log("Parsed countries:", countries.length)
    console.log("Sample countries:", countries.slice(0, 5))

    // Generate country flag emojis (simplified mapping)
    const flagMap = {
      Algeria: "🇩🇿",
      Angola: "🇦🇴",
      Benin: "🇧🇯",
      Botswana: "🇧🇼",
      "Burkina Faso": "🇧🇫",
      Burundi: "🇧🇮",
      Cameroon: "🇨🇲",
      "Cape Verde": "🇨🇻",
      "Central African Republic": "🇨🇫",
      Chad: "🇹🇩",
      Comoros: "🇰🇲",
      Congo: "🇨🇬",
      "Democratic Republic of the Congo": "🇨🇩",
      Djibouti: "🇩🇯",
      Egypt: "🇪🇬",
      "Equatorial Guinea": "🇬🇶",
      Eritrea: "🇪🇷",
      Eswatini: "🇸🇿",
      Ethiopia: "🇪🇹",
      Gabon: "🇬🇦",
      Gambia: "🇬🇲",
      Ghana: "🇬🇭",
      Guinea: "🇬🇳",
      "Guinea-Bissau": "🇬🇼",
      "Ivory Coast": "🇨🇮",
      Kenya: "🇰🇪",
      Lesotho: "🇱🇸",
      Liberia: "🇱🇷",
      Libya: "🇱🇾",
      Madagascar: "🇲🇬",
      Malawi: "🇲🇼",
      Mali: "🇲🇱",
      Mauritania: "🇲🇷",
      Mauritius: "🇲🇺",
      Morocco: "🇲🇦",
      Mozambique: "🇲🇿",
      Namibia: "🇳🇦",
      Niger: "🇳🇪",
      Nigeria: "🇳🇬",
      Rwanda: "🇷🇼",
      "Sao Tome and Principe": "🇸🇹",
      Senegal: "🇸🇳",
      Seychelles: "🇸🇨",
      "Sierra Leone": "🇸🇱",
      Somalia: "🇸🇴",
      "South Africa": "🇿🇦",
      "South Sudan": "🇸🇸",
      Sudan: "🇸🇩",
      Tanzania: "🇹🇿",
      Togo: "🇹🇬",
      Tunisia: "🇹🇳",
      Uganda: "🇺🇬",
      Zambia: "🇿🇲",
      Zimbabwe: "🇿🇼",
    }

    // Add flags to countries
    const countriesWithFlags = countries.map((country) => ({
      ...country,
      flag: flagMap[country.name] || "🌍",
    }))

    // Sort countries alphabetically
    countriesWithFlags.sort((a, b) => a.name.localeCompare(b.name))

    console.log("Countries with flags:", countriesWithFlags.slice(0, 10))

    return countriesWithFlags
  } catch (error) {
    console.error("Error fetching country codes:", error)
    return []
  }
}

// Run the function
fetchAfricanCountryCodes().then((countries) => {
  console.log("Final result:", countries)
})
