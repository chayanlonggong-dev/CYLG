"use client";

import {
  useEffect,
  useState,
} from "react";


interface Session {

  id:string;

  ip:string | null;

  userAgent:string | null;

  createdAt:string;

  lastActivityAt:string;

  expiresAt:string;

}


export default function SecurityPage(){

  const [
    sessions,
    setSessions,
  ] = useState<Session[]>([]);


  const [
    currentSessionId,
    setCurrentSessionId,
  ] = useState("");



  async function loadSessions(){

    const res =
      await fetch(
        "/api/admin/sessions"
      );


    if(res.ok){

      const data =
        await res.json();


      setSessions(
        data.sessions
      );


      setCurrentSessionId(
        data.currentSessionId
      );

    }

  }




  async function revokeSession(
    id:string
  ){

    const confirmDelete =
      confirm(
        "Logout this device?"
      );


    if(!confirmDelete){
      return;
    }



    await fetch(
      "/api/admin/sessions",
      {
        method:"DELETE",

        headers:{
          "Content-Type":
            "application/json",
        },

        body:JSON.stringify({
          sessionId:id,
        }),
      }
    );


    loadSessions();

  }





  useEffect(()=>{

    loadSessions();

  },[]);





  return (

    <main
      className="
      min-h-screen
      bg-[#050505]
      px-10
      py-10
      text-white
      "
    >

      <div
        className="
        mx-auto
        max-w-7xl
        "
      >

        <p
          className="
          uppercase
          tracking-[0.4em]
          text-yellow-500
          "
        >
          CYLG CMS
        </p>


        <h1
          className="
          mt-4
          text-5xl
          font-black
          "
        >
          Security Center
        </h1>



        <p
          className="
          mt-4
          text-gray-400
          "
        >
          Manage administrator security sessions.
        </p>





        <section
          className="
          mt-12
          rounded-3xl
          border
          border-yellow-500/20
          bg-[#101010]
          p-8
          "
        >


          <h2
            className="
            text-2xl
            font-bold
            text-yellow-400
            "
          >
            Active Devices
          </h2>



          <div
            className="
            mt-8
            space-y-5
            "
          >

          {
            sessions.map(
              (session)=>(

                <div
                  key={session.id}
                  className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-black
                  p-6
                  "
                >

                  <div
                    className="
                    flex
                    items-center
                    justify-between
                    gap-5
                    "
                  >

                    <div>


                      <p
                        className="
                        text-lg
                        font-bold
                        "
                      >
                        {
                          session.id === currentSessionId
                          ?
                          "Current Device"
                          :
                          "Logged In Device"
                        }
                      </p>



                      <p
                        className="
                        mt-2
                        text-sm
                        text-gray-400
                        "
                      >
                        IP:
                        {" "}
                        {
                          session.ip || "Unknown"
                        }
                      </p>



                      <p
                        className="
                        mt-2
                        text-sm
                        text-gray-400
                        "
                      >
                        Browser:
                        {" "}
                        {
                          session.userAgent || "Unknown"
                        }
                      </p>



                      <p
                        className="
                        mt-2
                        text-sm
                        text-gray-400
                        "
                      >
                        Last Activity:
                        {" "}
                        {
                          new Date(
                            session.lastActivityAt
                          )
                          .toLocaleString()
                        }
                      </p>


                    </div>




                    {
                      session.id !== currentSessionId
                      &&
                      (

                      <button
                        onClick={()=>
                          revokeSession(
                            session.id
                          )
                        }

                        className="
                        rounded-xl
                        border
                        border-red-500/40
                        px-5
                        py-3
                        text-red-400
                        hover:bg-red-500/10
                        "
                      >
                        Logout
                      </button>

                      )
                    }


                  </div>


                </div>

              )
            )
          }


          </div>


        </section>


      </div>


    </main>

  );

}