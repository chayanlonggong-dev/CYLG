"use client";

import Image from "next/image";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";


interface ModelGalleryProps {

  id:string;

  images:string[];

}





export default function ModelGallery({

  id,

  images,

}:ModelGalleryProps){



  const [current,setCurrent] =
    useState(0);


  const [open,setOpen] =
    useState(false);


  const [loaded,setLoaded] =
    useState(false);


  const [zoom,setZoom] =
    useState(1);



  const [position,setPosition] =
    useState({

      x:0,

      y:0,

    });




  const dragging =
    useRef(false);



  const dragStart =
    useRef({

      x:0,

      y:0,

    });



  const swipeStart =
    useRef<{
      pointerId:number;
      x:number;
      y:number;
    } | null>(null);

  const closeGallery =
    useCallback(()=>{

      setOpen(false);

    },[]);

  function startSwipe(
    e: React.PointerEvent<HTMLDivElement>
  ){

    if(e.pointerType!=="touch")
      return;

    swipeStart.current={
      pointerId:e.pointerId,
      x:e.clientX,
      y:e.clientY,
    };

    e.currentTarget.setPointerCapture(e.pointerId);

  }

  function endSwipe(
    e: React.PointerEvent<HTMLDivElement>
  ){

    const start = swipeStart.current;

    swipeStart.current=null;

    if(
      e.pointerType!=="touch" ||
      !start ||
      start.pointerId!==e.pointerId
    )
      return;

    const distance = start.x-e.clientX;
    const verticalDistance = Math.abs(start.y-e.clientY);

    if(
      Math.abs(distance)<48 ||
      verticalDistance>=Math.abs(distance)
    )
      return;

    if(distance>0){

      next();

    }else{

      previous();

    }

  }

  function startTouchSwipe(
    e: React.TouchEvent<HTMLDivElement>
  ){
    const touch = e.touches[0];

    swipeStart.current = {
      pointerId: -1,
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function endTouchSwipe(
    e: React.TouchEvent<HTMLDivElement>
  ){
    const start = swipeStart.current;

    swipeStart.current = null;

    if(!start)
      return;

    const touch = e.changedTouches[0];
    const distance = start.x - touch.clientX;
    const verticalDistance = Math.abs(start.y - touch.clientY);

    if(
      Math.abs(distance) < 48 ||
      verticalDistance >= Math.abs(distance)
    )
      return;

    if(distance > 0){
      next();
    }else{
      previous();
    }
  }



  function resetView(){

    setZoom(1);

    setPosition({

      x:0,

      y:0,

    });

  }



  function changeImage(
    index:number
  ){

    resetView();

    setLoaded(false);

    setCurrent(index);

  }






  const next =
    useCallback(()=>{


      setCurrent(prev=>{

        const nextIndex =
          prev + 1 >= images.length
          ? 0
          : prev + 1;


        return nextIndex;

      });


      resetView();


      setLoaded(false);



    },[
      images.length,
    ]);







  const previous =
    useCallback(()=>{


      setCurrent(prev=>{


        const previousIndex =
          prev === 0
          ? images.length - 1
          : prev - 1;


        return previousIndex;


      });



      resetView();


      setLoaded(false);



    },[
      images.length,
    ]);






  useEffect(()=>{


    document.body.style.overflow =
      open
      ? "hidden"
      : "";



    return ()=>{

      document.body.style.overflow="";

    };


  },[
    open,
  ]);






  useEffect(()=>{


    if(!open)
      return;



    function keyHandler(
      e:KeyboardEvent
    ){


      if(e.key==="Escape")
        closeGallery();



      if(e.key==="ArrowRight")
        next();



      if(e.key==="ArrowLeft")
        previous();



    }



    window.addEventListener(
      "keydown",
      keyHandler
    );



    return ()=>{

      window.removeEventListener(
        "keydown",
        keyHandler
      );

    };


  },[
    open,
    closeGallery,
    next,
    previous,
  ]);







  function wheelZoom(
    e:React.WheelEvent
  ){

    if(e.deltaY<0){

      setZoom(
        z=>Math.min(
          z+0.2,
          3
        )
      );


    }else{


      setZoom(
        z=>Math.max(
          z-0.2,
          1
        )
      );


    }


  }






  function doubleZoom(){


    setZoom(
      z=>z===1 ? 2 : 1
    );


  }






  function startDrag(
    e:React.MouseEvent
  ){


    if(zoom<=1)
      return;



    dragging.current=true;



    dragStart.current={

      x:
        e.clientX-position.x,


      y:
        e.clientY-position.y,

    };


  }






  function moveDrag(
    e:React.MouseEvent
  ){


    if(!dragging.current)
      return;



    setPosition({

      x:
        e.clientX-dragStart.current.x,


      y:
        e.clientY-dragStart.current.y,


    });


  }






  function stopDrag(){

    dragging.current=false;

  }






  if(!images.length)
    return null;






  return (

<section className="
bg-[#050505]
px-6
py-32
">


<div className="
mx-auto
max-w-7xl
">



<div className="
mb-16
text-center
">


<p className="
text-sm
uppercase
tracking-[0.6em]
text-yellow-400
">

Exclusive Collection

</p>



<h2 className="
mt-6
text-5xl
font-black
text-white
">

GALLERY

</h2>



</div>







<div

onClick={()=>
setOpen(true)
}

className="
relative
mx-auto
aspect-[4/5]
max-w-2xl
cursor-pointer
overflow-hidden
rounded-3xl
border
border-yellow-500/30
"

>


<Image

src={images[current]}

alt={`${id}-${current}`}

fill

priority

sizes="(max-width:768px) 100vw, 768px"

className="
object-cover
transition
duration-700
hover:scale-105
"

/>


</div>






<div className="
mt-10
flex
flex-wrap
justify-center
gap-5
">


{
images.map((image,index)=>(


<button

key={image}

onClick={()=>
changeImage(index)
}

className={`relative h-28 w-20 overflow-hidden rounded-xl border transition ${
current===index
?
"scale-110 border-yellow-400"
:
"border-white/20"
}`}

>


<Image

src={image}

alt={`${id}-${index}`}

fill

sizes="80px"

className="object-cover"

/>


</button>


))
}


</div>





</div>







{
open && (


<div

className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/95
"

        onPointerDown={(e)=>{

          if(e.target===e.currentTarget){

            closeGallery();

          }

        }}

        onClick={(e)=>{

          if(e.target===e.currentTarget){

            closeGallery();

          }

        }}

>



<button

type="button"

aria-label="Close gallery"

onPointerDown={(e)=>{
  e.stopPropagation();
  closeGallery();
}}

onClick={(e)=>{

e.stopPropagation();

closeGallery();

}}

className="
absolute
right-8
top-8
z-20
flex
h-12
w-12
items-center
justify-center
touch-manipulation
text-5xl
text-white
"

style={{

top:"calc(env(safe-area-inset-top, 0px) + 1rem)",

right:"max(1rem, env(safe-area-inset-right, 0px))",

}}

>

×

</button>





<div

className="
relative
h-[85vh]
w-[90vw]
overflow-hidden
touch-none
"

onClick={(e)=>
  e.stopPropagation()
}

onPointerDown={(e)=>{
  e.stopPropagation();
  startSwipe(e);
}}

onTouchStart={startTouchSwipe}

onTouchEnd={endTouchSwipe}

onPointerUp={endSwipe}

onPointerCancel={() => {
  swipeStart.current = null;
}}

onWheel={wheelZoom}

onDoubleClick={doubleZoom}

onMouseDown={startDrag}

onMouseMove={moveDrag}

onMouseUp={stopDrag}
>

<Image

src={images[current]}

alt={`${id}-${current}`}

fill

priority

sizes="90vw"

onLoad={() =>
  setLoaded(true)
}

draggable={false}

style={{

transform:
`translate(${position.x}px,${position.y}px) scale(${zoom})`,

transition:
dragging.current
?
"none"
:
"transform .4s ease",

opacity:
loaded
?
1
:
0,

}}

className="
object-contain
"

/>


</div>





<button

type="button"

aria-label="Previous image"

onClick={(e)=>{

e.stopPropagation();

previous();

}}

className="
absolute
left-6
z-10
touch-manipulation
text-6xl
text-yellow-400
"

>

‹

</button>




<button

type="button"

aria-label="Next image"

onClick={(e)=>{

e.stopPropagation();

next();

}}

className="
absolute
right-6
z-10
touch-manipulation
text-6xl
text-yellow-400
"

>

›

</button>





<div className="
absolute
bottom-8
text-yellow-400
tracking-[0.4em]
">

{current+1} / {images.length}

</div>



</div>


)

}



</section>

  );


}
