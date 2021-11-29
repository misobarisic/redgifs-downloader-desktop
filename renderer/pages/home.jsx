import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Link from 'next/link';

const {ipcRenderer} = require('electron')
import downloader from 'redgifs-downloader'
import Input from "../components/Input";
import Toggle from "../components/Toggle";


function Home() {
    const [instance, setInstance] = useState(downloader.instance(__dirname))
    const [links, setLinks] = useState([])
    const [dir, setDir] = useState("")
    const [term, setTerm] = useState("")
    const [minLikes, setMinLikes] = useState("")
    const [maxLikes, setMaxLikes] = useState("")
    const [minViews, setMinViews] = useState("")
    const [maxViews, setMaxVies] = useState("")
    const [mobile, setMobile] = useState(true)
    const [existing, setExisting] = useState(false)
    const [count, setCount] = useState("20")

    const [status, setStatus] = useState(new Map())

    useEffect(() => {
        setDir(ipcRenderer.sendSync('getHomeDir', '0'))
    }, [])


    const click = e => {
        // console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
        //
        // ipcRenderer.on('asynchronous-reply', (event, arg) => {
        //     console.log(arg) // prints "pong"
        // })
        // ipcRenderer.send('asynchronous-message', 'ping')

        // console.log(ipcRenderer.sendSync('get', '0'))

        ipcRenderer.send("startDownload", {
            term,
            dir,
            numberToDownload: count,
            minLikes: minLikes === "" ? undefined : minLikes,
            maxLikes: maxLikes === "" ? undefined : maxLikes,
            minViews: minViews === "" ? undefined : minViews,
            maxViews: maxViews === "" ? undefined : maxViews,
            skipExisting: existing,
            useMobile: mobile
        })

        console.log(ipcRenderer.sendSync("getState"))


        e.preventDefault();
        if (links.length === 0) {
            // downloader.getSearchLinks("oiled",{numberToDownload:5}).then(setLinks)
        }
    }

    return (
        <React.Fragment>
            <Head>
                <title>RedGIFs Downloader</title>
            </Head>
            <div className='grid grid-col-1 text-2xl w-full text-center my-4'>
        <span>
            RedGIFs Downloader
        </span>
            </div>
            <div className='mt-1 w-full flex-wrap flex justify-center'>
                <a className='btn-blue' onClick={click}>Download</a>
            </div>
            <div className="flex flex-col space-y-2 items-center mt-4">
                <Input value={dir} onInputHandler={e => setDir(e.target.value)} placeholder="" label="Download folder"/>
                <Input value={term} onInputHandler={e => setTerm(e.target.value)}
                       placeholder='Leave empty for "trending"' label="Search term"/>
                <Input value={count} onInputHandler={e => setCount(e.target.value)} placeholder=""
                       label="Number of clips"/>
                <div className="flex flex-col space-y-2 items-center">
                    <div className="text-xl pt-2 pb-1">
                        Parameters (optional)
                    </div>
                    <Input value={minLikes} onInputHandler={e => setMinLikes(e.target.value)} placeholder=""
                           label="Min likes"/>
                    <Input value={maxLikes} onInputHandler={e => setMaxLikes(e.target.value)} placeholder=""
                           label="Max likes"/>
                    <Input value={minViews} onInputHandler={e => setMinViews(e.target.value)} placeholder=""
                           label="Min views"/>
                    <Input value={maxViews} onInputHandler={e => setMaxVies(e.target.value)} placeholder=""
                           label="Max views"/>
                    <Toggle text="Skip existing" enabled={existing} setEnabled={setExisting}/>
                    <Toggle text="Smaller file size (mobile)" enabled={mobile} setEnabled={setMobile}/>
                </div>
            </div>
            <div className="flex flex-col space-y-2 items-center mt-4">
                {links.map((link, idx) => <p>{idx + 1} {link.id}</p>)}
            </div>
        </React.Fragment>
    );
}

export default Home;
