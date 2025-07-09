import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import { useTranslation } from "react-i18next";

function MuhuratPage() {
  const { t, i18n } = useTranslation();

  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const translateSafe = (key) => {
    if (!key) return "";
    const trimmed = key.trim();
    const translated = t(trimmed);
    return translated !== trimmed ? translated : trimmed;
  };

  const handleCityChange = async (e) => {
    const input = e.target.value;
    setCity(input);
    setSelectedCity(null);

    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        "https://shubh-muhurat-server.onrender.com/api/geocode",
        {
          params: { city: input },
        }
      );
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (s) => {
    setCity(s.cityName);
    setSelectedCity(s);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCity) {
      alert(t("selectCityAlert"));
      return;
    }

    try {
      setLoading(true);

      const muhuratRes = await axios.get(
        "https://shubh-muhurat-server.onrender.com/api/muhurat",
        {
          params: {
            date,
            lat: selectedCity.lat,
            lon: selectedCity.lon,
          },
        }
      );

      setResult({
        ...muhuratRes.data.data,
        cityName: selectedCity.cityName,
      });
    } catch (error) {
      console.error(error);
      alert(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (str) =>
    new Date(str).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleReset = () => {
    setDate("");
    setCity("");
    setSelectedCity(null);
    setSuggestions([]);
    setResult(null);
  };

  return (
    <div className="App">
      <h1>{t("title")}</h1>

      <div className="lang-buttons">
        <button onClick={() => handleChangeLanguage("en")} className="lang-btn">
          English
        </button>
        <button onClick={() => handleChangeLanguage("gu")} className="lang-btn">
          ગુજરાતી
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="input-label">
          {t("date")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <div style={{ position: "relative", marginTop: "10px" }}>
          <input
            type="text"
            placeholder={t("cityPlaceholder")}
            value={city}
            onChange={handleCityChange}
            required
          />

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, idx) => (
                <li key={idx} onClick={() => handleSelectSuggestion(s)}>
                  {s.cityName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="submit-btn">
          {loading ? t("loading") : t("getMuhurat")}
        </button>
      </form>

      {result && (
        <div className="result-section">
          <h2>
            {t("resultsFor")} {result.cityName}
          </h2>
          <p>
            <strong>{t("vaara")}:</strong> {translateSafe(result.vaara)}
          </p>
          <p>
            <strong>{t("sunrise")}:</strong> {formatTime(result.sunrise)}
          </p>
          <p>
            <strong>{t("sunset")}:</strong> {formatTime(result.sunset)}
          </p>
          <p>
            <strong>{t("moonrise")}:</strong> {formatTime(result.moonrise)}
          </p>
          <p>
            <strong>{t("moonset")}:</strong> {formatTime(result.moonset)}
          </p>

          <h3>{t("tithi")}</h3>
          {result.tithi?.map((tithiItem) => (
            <p key={tithiItem.id}>
              {translateSafe(tithiItem.name)} ({translateSafe(tithiItem.paksha)}) <br />
              {t("start")}: {formatTime(tithiItem.start)} <br />
              {t("end")}: {formatTime(tithiItem.end)}
            </p>
          ))}

          <h3>{t("nakshatra")}</h3>
          {result.nakshatra?.map((nItem) => (
            <p key={nItem.id}>
              {translateSafe(nItem.name)} ({t("lord")}: {translateSafe(nItem.lord?.name)}) <br />
              {t("start")}: {formatTime(nItem.start)} <br />
              {t("end")}: {formatTime(nItem.end)}
            </p>
          ))}

          <h3>{t("karana")}</h3>
          {result.karana?.map((kItem, i) => (
            <p key={i}>
              {translateSafe(kItem.name)} <br />
              {t("start")}: {formatTime(kItem.start)} <br />
              {t("end")}: {formatTime(kItem.end)}
            </p>
          ))}

          <h3>{t("yoga")}</h3>
          {result.yoga?.map((yItem, i) => (
            <p key={i}>
              {translateSafe(yItem.name)} <br />
              {t("start")}: {formatTime(yItem.start)} <br />
              {t("end")}: {formatTime(yItem.end)}
            </p>
          ))}

          <button onClick={handleReset} className="reset-btn">
            {t("reset")}
          </button>
        </div>
      )}
    </div>
  );
}

export default MuhuratPage;
