// // import { useEffect, useState } from 'react';

// // export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
// //   const [isVisible, setIsVisible] = useState(true);

// //   useEffect(() => {
// //     const hideTimer = setTimeout(() => {
// //       setIsVisible(false);
// //     }, duration);

// //     const closeTimer = setTimeout(onClose, duration + 300);

// //     return () => {
// //       clearTimeout(hideTimer);
// //       clearTimeout(closeTimer);
// //     };
// //   }, [duration, onClose]);

// //   const types = {
// //     success: 'bg-green-500',
// //     error: 'bg-red-500',
// //     warning: 'bg-yellow-500',
// //     info: 'bg-blue-500'
// //   };

// //   return (
// //     <div
// //       className={`fixed top-4 right-4 z-[99999] px-6 py-4 rounded-lg text-white font-medium shadow-xl transition-all duration-300 ${types[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
// //     >
// //       {message}
// //     </div>
// //   );
// // };


// import { useEffect, useRef, useState } from 'react';

// export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
//   const onCloseRef = useRef(onClose);
//   useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const hideTimer  = setTimeout(() => setIsVisible(false), duration);
//     const closeTimer = setTimeout(() => onCloseRef.current?.(), duration + 300);
//     return () => {
//       clearTimeout(hideTimer);
//       clearTimeout(closeTimer);
//     };
//   }, [duration]); // onClose intentionally excluded — ref handles updates

//   const styles = {
//     success: {
//       bg:   'bg-green-50 border-green-200',
//       icon: 'bg-green-100 text-green-600',
//       text: 'text-green-800',
//       bar:  'bg-green-400',
//     },
//     error: {
//       bg:   'bg-red-50 border-red-200',
//       icon: 'bg-red-100 text-red-600',
//       text: 'text-red-800',
//       bar:  'bg-red-400',
//     },
//     warning: {
//       bg:   'bg-yellow-50 border-yellow-200',
//       icon: 'bg-yellow-100 text-yellow-600',
//       text: 'text-yellow-800',
//       bar:  'bg-yellow-400',
//     },
//     info: {
//       bg:   'bg-blue-50 border-blue-200',
//       icon: 'bg-blue-100 text-blue-600',
//       text: 'text-blue-800',
//       bar:  'bg-blue-400',
//     },
//   };

//   const icons = {
//     success: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//       </svg>
//     ),
//     error: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//       </svg>
//     ),
//     warning: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//           d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//       </svg>
//     ),
//     info: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//           d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
//       </svg>
//     ),
//   };

//   const s = styles[type] || styles.info;

//   return (
//     <div
//       className={`
//         fixed top-4 right-4 z-[99999]
//         flex items-start gap-3
//         min-w-[280px] max-w-sm
//         rounded-xl border shadow-lg
//         overflow-hidden
//         transition-all duration-300
//         ${s.bg}
//         ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}
//       `}
//     >
//       {/* Icon */}
//       <div className={`shrink-0 mt-3 ml-3 p-1.5 rounded-lg ${s.icon}`}>
//         {icons[type]}
//       </div>

//       {/* Message */}
//       <p className={`flex-1 py-3 pr-2 text-sm font-medium leading-relaxed ${s.text}`}>
//         {message}
//       </p>

//       {/* Close button */}
//       <button
//         onClick={() => {
//           setIsVisible(false);
//           setTimeout(() => onCloseRef.current?.(), 300);
//         }}
//         className={`shrink-0 mt-2.5 mr-2 p-1 rounded-lg opacity-60 hover:opacity-100 transition ${s.icon}`}
//         aria-label="Dismiss"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//         </svg>
//       </button>

//       {/* Progress bar */}
//       <div className={`absolute bottom-0 left-0 h-0.5 ${s.bar}`}
//         style={{
//           width: isVisible ? '0%' : '100%',
//           transition: isVisible ? `width ${duration}ms linear` : 'none',
//           animationFillMode: 'forwards',
//         }}
//       />
//     </div>
//   );
// };

import { useEffect, useRef, useState } from 'react';

export const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [isVisible, setIsVisible] = useState(true);

  // Stable timer — runs once on mount, never resets on re-render
  useEffect(() => {
    const hideTimer  = setTimeout(() => setIsVisible(false), duration);
    const closeTimer = setTimeout(() => onCloseRef.current?.(), duration + 300);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const config = {
    success: {
      wrapper: 'bg-green-50 border-green-200',
      icon:    'bg-green-100 text-green-600',
      text:    'text-green-900',
      bar:     'bg-green-400',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      wrapper: 'bg-red-50 border-red-200',
      icon:    'bg-red-100 text-red-600',
      text:    'text-red-900',
      bar:     'bg-red-400',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      wrapper: 'bg-yellow-50 border-yellow-200',
      icon:    'bg-yellow-100 text-yellow-600',
      text:    'text-yellow-900',
      bar:     'bg-yellow-400',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    info: {
      wrapper: 'bg-blue-50 border-blue-200',
      icon:    'bg-blue-100 text-blue-600',
      text:    'text-blue-900',
      bar:     'bg-blue-400',
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const c = config[type] || config.info;

  const handleManualClose = () => {
    setIsVisible(false);
    setTimeout(() => onCloseRef.current?.(), 300);
  };

  return (
    <div
      role="alert"
      className={`
        fixed top-4 right-4 z-[99999]
        flex items-start gap-3
        min-w-[300px] max-w-sm w-full
        rounded-2xl border shadow-lg
        overflow-hidden
        transition-all duration-300
        ${c.wrapper}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}
      `}
    >
      {/* Coloured icon pill */}
      <div className={`shrink-0 mt-3.5 ml-4 p-1.5 rounded-lg ${c.icon}`}>
        {c.svg}
      </div>

      {/* Message */}
      <p className={`flex-1 py-3.5 pr-1 text-sm font-semibold leading-relaxed ${c.text}`}>
        {message}
      </p>

      {/* ✕ close button */}
      <button
        onClick={handleManualClose}
        aria-label="Dismiss notification"
        className={`shrink-0 mt-3 mr-3 p-1 rounded-lg transition-opacity opacity-50 hover:opacity-100 ${c.icon}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Drain bar — starts full-width, shrinks to 0 over `duration` ms */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${c.bar} transition-none`}
        style={{
          width:      '100%',
          animation:  isVisible ? `drain ${duration}ms linear forwards` : 'none',
        }}
      />

      <style>{`
        @keyframes drain {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
};