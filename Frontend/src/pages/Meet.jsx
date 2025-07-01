import React, { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../constants/constants';
import { io } from "socket.io-client";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function Meet() {

    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const videoRef = useRef([]);

    const [videoAvail, setVideoAvail] = useState(true);
    const [audioAvail, setAudioAvail] = useState(true);
    const [video, setVideo] = useState([]);
    const [audio, setAudio] = useState();
    const [screen, setScreen] = useState();
    const [screenAvail, setScreenAvail] = useState(true);
    const [showModel, setShowModel] = useState();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUserName, setAskForUserName] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);


    // if(isChrome() === false){
    // }

    // Permissions
    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

            setVideoAvail(!!videoPermission);
            setAudioAvail(!!audioPermission);
            setScreenAvail(!!navigator.mediaDevices.getDisplayMedia);

            if (videoAvail && audioAvail) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvail, audio: audioAvail });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Get Media
    let getUserMediaSuccess = (stream) => { };
    let getUserMedia = () => {
        if ((video && videoAvail) || (audio && audioAvail)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then(() => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {
                console.log(e);
            }
        }
    };

    // Socket Callbacks
    let gotMessageFromServer = (formId, message) => { };
    let addMessage = () => { };

    // Connect to socket
    let connectToSocketServer = () => {
        socketRef.current = io(BASE_URL, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit("accept-call", window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideo((videos => videos.filter((video) => video.socketId !== id)));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].ontrack = (event) => {
                        const stream = event.streams[0];
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updated = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream } : video
                                );
                                videoRef.current = updated;
                                return updated;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream,
                                autoPlay: true,
                                playsInline: true
                            };
                            setVideos(videos => {
                                const updated = [...videos, newVideo];
                                videoRef.current = updated;
                                return updated;
                            });
                        }
                    };

                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 !== socketIdRef.current) continue;
                        try {
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        } catch (e) {
                            console.log(e);
                        }
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                                })
                                .catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    };

    // Media Setup
    let getMedia = () => {
        setVideo(videoAvail);
        setAudio(audioAvail);
        connectToSocketServer();
    };

    // Connect Button
    let connect = () => {
        setAskForUserName(false);
        getMedia();
    };

    // Hooks
    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 lg:pb-3 pb-10">
            <div className="flex flex-col lg:flex-row items-center justify-around w-full max-w-7xl gap-10 py-10">

                {/* Left: Video Section */}
                <div className="w-full bg-black lg:w-1/2 flex items-center justify-center rounded-4xl">
                    <div className="w-full max-w-[650px] rounded-4xl aspect-[4/3]">
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
                                onClick={connect}
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
