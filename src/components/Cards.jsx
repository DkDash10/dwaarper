import React from 'react';
import { useRef } from 'react'

export default function Cards() {
    const scrollRef = useRef(null);

    const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    };

    const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    };
    return (
        <div className='home' style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p>Multiple cards alert!</p>
                <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={scrollLeft} style={{ padding: "10px" }}>←</button>
                <button onClick={scrollRight} style={{ padding: "10px" }}>→</button>
                </div>
            </div>
            <div className='home_cards' ref={scrollRef} style={{ display: "flex",gap: "2rem", flexGrow: 1 }}>
                <div className='home_card' style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                <img src="https://via.placeholder.com/150" alt="Card 1" style={{ width: "100%", borderRadius: "8px", display: "flex", gap: "20px"}} />
                <h3>Card 1</h3>
                <p>This is the description for Card 1.</p>
                <div>
                    <select name="" id="">
                    {Array.from(Array(6), (e, i) => {
                        return(
                        <option value={i+1} key={i+1}>Option {i+1}</option>
                        )
                    })}
                    </select>
                </div>
                <button>Learn More</button>
                </div>
                {/* <div className='home_card' style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                <img src="https://via.placeholder.com/150" alt="Card 1" style={{ width: "100%", borderRadius: "8px", display: "flex", gap: "20px"}} />
                <h3>Card 1</h3>
                <p>This is the description for Card 1.</p>
                <div>
                    <select name="" id="">
                    {Array.from(Array(6), (e, i) => {
                        return(
                        <option value={i+1} key={i+1}>Option {i+1}</option>
                        )
                    })}
                    </select>
                </div>
                <button>Learn More</button>
                </div>
                <div className='home_card' style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                <img src="https://via.placeholder.com/150" alt="Card 1" style={{ width: "100%", borderRadius: "8px", display: "flex", gap: "20px"}} />
                <h3>Card 1</h3>
                <p>This is the description for Card 1.</p>
                <div>
                    <select name="" id="">
                    {Array.from(Array(6), (e, i) => {
                        return(
                        <option value={i+1} key={i+1}>Option {i+1}</option>
                        )
                    })}
                    </select>
                </div>
                <button>Learn More</button>
                </div>
                <div className='home_card' style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                <img src="https://via.placeholder.com/150" alt="Card 1" style={{ width: "100%", borderRadius: "8px", display: "flex", gap: "20px"}} />
                <h3>Card 1</h3>
                <p>This is the description for Card 1.</p>
                <div>
                    <select name="" id="">
                    {Array.from(Array(6), (e, i) => {
                        return(
                        <option value={i+1} key={i+1}>Option {i+1}</option>
                        )
                    })}
                    </select>
                </div>
                <button>Learn More</button>
                </div>
                <div className='home_card' style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "0.5rem", textAlign: "center" }}>
                <img src="https://via.placeholder.com/150" alt="Card 1" style={{ width: "100%", borderRadius: "8px", display: "flex", gap: "20px"}} />
                <h3>Card 1</h3>
                <p>This is the description for Card 1.</p>
                <div>
                    <select name="" id="">
                    {Array.from(Array(6), (e, i) => {
                        return(
                        <option value={i+1} key={i+1}>Option {i+1}</option>
                        )
                    })}
                    </select>
                </div>
                <button>Learn More</button>
                </div> */}
            </div>
            </div>
    )
}
