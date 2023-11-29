import React, { useEffect, useState } from 'react'
import "./Style.css"
import icon from "./location.png"
import Humadity from "./humadity.png"
import wind from "./wind.png"
// import brokencloud from "./cloud/Broken-cloud.png"
import cloud from "./cloud/cloud.png"

export default function Home() {
  const [city, setCity] = useState(null);
  const [search, setSearch] = useState('INDORE');


  useEffect(() => {
    const fetchApi = async () => {
      setCity(null);
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=38f328cc7b3fe54f9cc663d587eadfa6&units=metric`
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      if (data.cod === 200) {
        setCity(data);
      }

    }
    fetchApi();
  }, [search])




  return (
    <React.Fragment>
      <h1>Weather app</h1>
      <div className='Main' >
        <input type="text" placeholder='Enter City Name' className='input' onChange={(e) => setSearch(e.target.value)} />

        {
          !city ? (<p>City Name Not Found</p>) : (
            <div>
             
              <img src={cloud} alt="cloud-img" id='weather-icon' />
              <h4> {city.weather[0].description}</h4>
              <h3 className='mt-3'> <img src={icon} alt="Location-Icon" />{search}   : {city.main.temp}°C</h3>
              <div className="row">
                <div className="col-sm-12 ">
                  <div className='humadity1'>
                  <img src={Humadity} alt="cloud-img" id='humadity' className='mt-3' /><h6 className='mt-0'>{city.main.humidity} <br />Humidity </h6>
                  </div>
                  <div className='wind'>
                  <img src={wind} alt="cloud-img" id='wind' className='mt-4' /><h6 className='mt-0'>{city.wind.speed} km/h <br />Wind </h6>
                  </div>
                  
                </div>
                
              </div>


            </div>
          )
        }

      </div>
    </React.Fragment>
  )
}
