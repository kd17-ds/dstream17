import React, { useRef, useState } from 'react';
import { BASE_URL } from '../constants/constants';

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function Meet() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let [videoAvail, setVideoAvail] = useState(true);
    let [audioAvail, setAudioAvail] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModel, setShowModel] = useState();
    let [screenAvail, setScreenAvail] = useState(true);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUserName, setAskForUserName] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([]);
    const videoRef = useRef([]);

    // if(isChrome() === false){

    // }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 lg:pb-3 pb-10">
            <div className="flex flex-col lg:flex-row items-center justify-around w-full max-w-7xl gap-10 py-10">

                {/* Left: Video Section */}
                <div className="w-full bg-black lg:w-1/2 flex items-center justify-center p-4">
                    <div className="w-full max-w-[550px] aspect-[4/3]">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-contain rounded"
                        />
                    </div>
                </div>

                {/* Right: Username + Button */}
                {askForUserName && (
                    <div className="w-full lg:w-1/3 flex flex-col justify-center items-center pr-4">
                        <div className="w-full max-w-sm">
                            <h2 className="text-2xl font-semibold mb-4 text-center">Enter Your Name</h2>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your name"
                                className="w-full p-3 mb-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sec"
                            />
                            <button
                                className="w-full bg-sec text-white py-2 rounded hover:bg-lite transition hover:cursor-pointer"
                                onClick={() => {
                                    if (username.trim()) setAskForUserName(false);
                                }}
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
