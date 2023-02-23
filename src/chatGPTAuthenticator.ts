/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630.pw
 * Date: 2023-02-22
 * Time: 10:27
 * About: it is possible to use tor as a proxy. to do this, run multiple copies of tor and add the port numbers to the torPorts variable
 *
 */

import makeSession from "fetch-cookie"
import fetch from "cross-fetch"
import {URLSearchParams} from  'url'
import {SocksProxyAgent} from 'socks-proxy-agent'


export interface IchatGPTAuthenticatorParams{
    email:string,
    password:string,
}

export interface IchatGPTAuthenticatorResultOk{
    accessToken:string,
    cookie?:string
}

export interface IchatGPTAuthenticatorResult{
    error?:string,
    result?:IchatGPTAuthenticatorResultOk
}


export interface IchatGPTAuthenticator{
    (params:IchatGPTAuthenticatorParams):Promise<IchatGPTAuthenticatorResult>
}


const getError = function (htmlString:string){

    const regex = /<h1[^>]*>([^<]*)<\/h1>/i
    const match = htmlString.match(regex)
    const errResume = match ? match[1] : null

    return errResume
}



const chatGPTAuthenticator:IchatGPTAuthenticator = async function ({ email,password}){

    try {

        const apiUrls:string[] = [
            "https://explorer.api.openai.com/api/auth/csrf",
            "https://explorer.api.openai.com/api/auth/signin/auth0?prompt=login",
            "https://auth0.openai.com/u/login/identifier?state=",
            "https://auth0.openai.com/u/login/password?state=",
            "https://auth0.openai.com/authorize/resume?state=",
            "https://explorer.api.openai.com/api/auth/session"
        ]

        const torPorts = [9050,9060,9070]
        const torUrl = 'socks5://127.0.0.1'

        const checkTor = async (url:string,port:number) =>{
            try {
                const agent  = new SocksProxyAgent(`${url}:${port}`)

                await fetch('https://api.ipify.org/',{
                    // @ts-ignore
                    agent
                })

                return agent
            }catch (e){
                return
            }
        }

        const rand = Math.floor(Math.random() * torPorts.length)
        const agent  = await checkTor(torUrl,torPorts[rand])

        const sessionFetch = makeSession(fetch)

        const csrfTokenPage = await sessionFetch( apiUrls[0],{
            // @ts-ignore
            agent,
        })

        const {csrfToken} = await csrfTokenPage.json()

        if(!csrfToken){
            throw new Error('csrfToken is empty')
        }

        const signinPage = await sessionFetch(  apiUrls[1],
            {
                // @ts-ignore
                agent,
                method: "POST",
                body: new URLSearchParams({
                    callbackUrl: "/",
                    csrfToken,
                    json: "true",
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })

        const {url} = await signinPage.json()

        if(!url){
            throw new Error('url is empty')
        }

        const redirect = await sessionFetch(url,{
            // @ts-ignore
            agent,
            redirect: "manual",
        })

        const csrfHtmlString = await redirect.text()

        const errСsrf = getError(csrfHtmlString)
        if(errСsrf){
            throw new Error(errСsrf)
        }

        const csrf = csrfHtmlString.slice(48)

        if(!csrf){
            throw new Error( 'csrf is empty')
        }

        const loginIdentifier = await sessionFetch(`${apiUrls[2]}${csrf}`,
            {
                // @ts-ignore
                agent,
                method: "POST",
                body: new URLSearchParams({
                    state:csrf,
                    username:email,
                    "js-available": "false",
                    "webauthn-available": "true",
                    "is-brave": "false",
                    "webauthn-platform-available": "true",
                    action: "default",
                }),
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
            })

        const loginIdentifierHtml = await loginIdentifier.text()


        const passwordIdentifier = await sessionFetch( `${apiUrls[3]}${csrf}`,
            {
                // @ts-ignore
                agent,
                method: "POST",
                body: new URLSearchParams({
                    state:csrf,
                    username:email,
                    password,
                    action: "default",
                }),

                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                redirect: "manual",
            })



        const newCsrfHtmlString = await passwordIdentifier.text()
        const errNewСsrf = getError(newCsrfHtmlString)

        if(errNewСsrf){
            throw new Error(errNewСsrf)
        }

        const newCsrf = newCsrfHtmlString.slice(46)

        if(!newCsrf){
            throw new Error('new csrf is empty')
        }

        const resume = await sessionFetch(`${apiUrls[4]}${newCsrf}`,{
            // @ts-ignore
            agent,
        })

        const htmlString = await resume.text()

        const errResume = getError(htmlString)

        if(errResume){
            throw new Error(errResume)
        }

        const session = await sessionFetch( apiUrls[5],{
            // @ts-ignore
            agent,
        })

        const { accessToken } = await session.json()

        if(!accessToken){
            throw new Error('access token is empty')
        }

        const cookie = session?.headers ? session?.headers?.get("set-cookie")?.split(";")[0] : undefined

        const result:IchatGPTAuthenticatorResultOk = {
            accessToken,
            cookie
        }


        return {result}


    }catch (e) {
        return {error:(e as Error)?.message}
    }

}


export default chatGPTAuthenticator