import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../constants/constants";
import { io } from "socket.io-client";

var connections = {};

const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function Meet() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    useEffect(() => {
        console.log("HELLO");
        getPermissions();
    });

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices
                    .getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e));
            }
        }
    };

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log("Video permission granted");
            } else {
                setVideoAvailable(false);
                console.log("Video permission denied");
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log("Audio permission granted");
            } else {
                setAudioAvailable(false);
                console.log("Audio permission denied");
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable,
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio]);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach((track) => track.stop());
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                console.log(description);
                connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit(
                            "signal",
                            id,
                            JSON.stringify({ sdp: connections[id].localDescription })
                        );
                    })
                    .catch((e) => console.log(e));
            });
        }

        stream.getTracks().forEach(
            (track) =>
            (track.onended = () => {
                setVideo(false);
                setAudio(false);

                try {
                    let tracks = localVideoref.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                } catch (e) {
                    console.log(e);
                }

                let blackSilence = (...args) =>
                    new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                localVideoref.current.srcObject = window.localStream;

                for (let id in connections) {
                    connections[id].addStream(window.localStream);

                    connections[id].createOffer().then((description) => {
                        connections[id]
                            .setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit(
                                    "signal",
                                    id,
                                    JSON.stringify({ sdp: connections[id].localDescription })
                                );
                            })
                            .catch((e) => console.log(e));
                    });
                }
            })
        );
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices
                .getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            } catch (e) { }
        }
    };

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE");
        try {
            window.localStream.getTracks().forEach((track) => track.stop());
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit(
                            "signal",
                            id,
                            JSON.stringify({ sdp: connections[id].localDescription })
                        );
                    })
                    .catch((e) => console.log(e));
            });
        }

        stream.getTracks().forEach(
            (track) =>
            (track.onended = () => {
                setScreen(false);

                try {
                    let tracks = localVideoref.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                } catch (e) {
                    console.log(e);
                }

                let blackSilence = (...args) =>
                    new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                localVideoref.current.srcObject = window.localStream;

                getUserMedia();
            })
        );
    };

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId]
                    .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId]
                                .createAnswer()
                                .then((description) => {
                                    connections[fromId]
                                        .setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit(
                                                "signal",
                                                fromId,
                                                JSON.stringify({
                                                    sdp: connections[fromId].localDescription,
                                                })
                                            );
                                        })
                                        .catch((e) => console.log(e));
                                })
                                .catch((e) => console.log(e));
                        }
                    })
                    .catch((e) => console.log(e));
            }

            if (signal.ice) {
                connections[fromId]
                    .addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch((e) => console.log(e));
            }
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(BASE_URL, { secure: false });

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    // Wait for their ice candidate
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit(
                                "signal",
                                socketListId,
                                JSON.stringify({ ice: event.candidate })
                            );
                        }
                    };

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(
                            (video) => video.socketId === socketListId
                        );

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos((videos) => {
                                const updatedVideos = videos.map((video) =>
                                    video.socketId === socketListId
                                        ? { ...video, stream: event.stream }
                                        : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true,
                            };

                            setVideos((videos) => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) =>
                            new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2]
                                .setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit(
                                        "signal",
                                        id2,
                                        JSON.stringify({ sdp: connections[id2].localDescription })
                                    );
                                })
                                .catch((e) => console.log(e));
                        });
                    }
                }
            });
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {
            width,
            height,
        });
        canvas.getContext("2d").fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    };

    let handleAudio = () => {
        setAudio(!audio);
        // getUserMedia();
    };

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);

    let handleScreen = () => {
        setScreen(!screen);
    };

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
        } catch (e) { }
        window.location.href = "/";
    };

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    };

    let closeChat = () => {
        setModal(false);
    };

    let handleMessage = (e) => {
        setMessage(e.target.value);
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data },
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    };

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 lg:pb-3 pb-10">
            <div className="flex flex-col lg:flex-row items-center justify-around w-full max-w-7xl gap-10 py-10">
                {/* Left: Video Section */}
                <div className="w-full bg-black lg:w-1/2 flex items-center justify-center rounded-4xl">
                    <div className="w-full max-w-[650px] rounded-4xl aspect-[4/3]">
                        <video ref={localVideoref} autoPlay muted playsInline className="w-full h-full object-contain rounded" />
                    </div>
                </div>

                {/* Right: Username + Button */}
                {askForUsername ? (
                    <div className="w-full lg:w-1/3 flex flex-col justify-center items-center pr-4">
                        <div className="w-full max-w-sm">
                            <h2 className="text-2xl font-semibold mb-4 text-center">Enter into Lobby</h2>
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
                ) : (
                    <div className="w-full lg:w-2/3 flex flex-col gap-6">
                        {showModal && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h1 className="text-xl font-bold mb-4">Chat</h1>
                                <div className="h-60 overflow-y-auto border rounded p-3 mb-4">
                                    {messages.length !== 0 ? (
                                        messages.map((item, index) => (
                                            <div key={index} className="mb-4">
                                                <p className="font-semibold">{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No Messages Yet</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter your chat"
                                        className="flex-grow p-2 border rounded"
                                    />
                                    <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handleVideo} className="p-2 bg-gray-800 text-white rounded">
                                {video ? "📹" : "🚫📹"}
                            </button>
                            <button onClick={handleEndCall} className="p-2 bg-red-600 text-white rounded">📞</button>
                            <button onClick={handleAudio} className="p-2 bg-gray-800 text-white rounded">
                                {audio ? "🎙️" : "🚫🎙️"}
                            </button>
                            {screenAvailable && (
                                <button onClick={handleScreen} className="p-2 bg-gray-800 text-white rounded">
                                    {screen ? "🖥️" : "📴🖥️"}
                                </button>
                            )}
                            <button onClick={() => setModal(!showModal)} className="relative p-2 bg-gray-800 text-white rounded">
                                💬
                                {newMessages > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                        {newMessages}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="rounded-4xl overflow-hidden">
                            <video className="w-full rounded-lg mt-4" ref={localVideoref} autoPlay muted></video>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                            {videos.map((video) => (
                                <div key={video.socketId} className="bg-black rounded-lg overflow-hidden">
                                    <video
                                        data-socket={video.socketId}
                                        ref={(ref) => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        className="w-full h-auto"
                                    ></video>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}
