const searchFlights = async (req = new Request(), res = new Response()) => {
  const searchOptions = {
    EndUserIp:
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      req.ip,
    ClientId: process.env.EMBARK_CLIENT_ID,
    UserName: process.env.EMBARK_USERNAME,
    Password: process.env.EMBARK_API_PASSWORD,
    AdultCount: req.body.AdultCount || 1,
    ChildCount: req.body.ChildCount || 0,
    InfantCount: req.body.InfantCount || 0,
    JourneyType: req.body.JourneyType || 1, // 1 - OneWay, 2 – Return, 3 – Multi City
    DirectFlight: req.body.DirectFlight || false,
    Segments: [
      ...req.body.Segments.map((segment) => {
        return {
          Origin: segment.Origin,
          Destination: segment.Destination,
          FlightCabinClass: segment.FlightCabinClass || 1, // 1 for All, 2 for Economy, 4 for Business, 6 for First Class
          PreferredDepartureTime:
            segment.PreferredDepartureTime ||
            new Date().toISOString("YYYY-MM-DDTHH:mm:ss").split("T")[0] +
              "T00:00:00",
          PreferredArrivalTime:
            segment.PreferredArrivalTime ||
            new Date().toISOString("YYYY-MM-DDTHH:mm:ss").split("T")[0] +
              "T00:00:00",
        };
      }),
    ],
  };

  const searchResults = await fetch(`${process.env.EMBARK_API_URL}/Search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Token": process.env.EMBARK_API_TOKEN,
    },
    body: JSON.stringify(searchOptions),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
    });

  res.status(200).json(searchResults);
};

const getFareRules = async (req, res) => {
  try {
    const fareRuleOptions = {
      EndUserIp:
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        req.ip,
      ClientId: process.env.EMBARK_CLIENT_ID,
      UserName: process.env.EMBARK_USERNAME,
      Password: process.env.EMBARK_API_PASSWORD,
      SrdvType: req.body.SrdvType,
      SrdvIndex: req.body.SrdvIndex,
      TraceId: req.body.TraceId,
      ResultIndex: req.body.ResultIndex,
    };
    const fareRules = await fetch(`${process.env.EMBARK_API_URL}/FareRule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.EMBARK_API_TOKEN,
      },
      body: JSON.stringify(fareRuleOptions),
    });
    const fareRulesData = await fareRules.json();
    res.status(200).json(fareRulesData);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

const getFareQuote = async (req, res) => {
  try {
    const fareQuoteOptions = {
      EndUserIp:
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        req.ip,
      ClientId: process.env.EMBARK_CLIENT_ID,
      UserName: process.env.EMBARK_USERNAME,
      Password: process.env.EMBARK_API_PASSWORD,
      SrdvType: req.body.SrdvType,
      SrdvIndex: req.body.SrdvIndex,
      TraceId: req.body.TraceId,
      ResultIndex: req.body.ResultIndex,
    };
    const fareQuote = await fetch(`${process.env.EMBARK_API_URL}/FareQuote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.EMBARK_API_TOKEN,
      },
      body: JSON.stringify(fareQuoteOptions),
    });
    const fareQuoteData = await fareQuote.json();
    res.status(200).json(fareQuoteData);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

module.exports = { searchFlights, getFareRules, getFareQuote };
