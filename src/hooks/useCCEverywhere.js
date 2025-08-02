import { useEffect, useState } from "react";

const useCCEverywhere = () => {
    const [ccEverywhere, setCCEverywhere] = useState(null);

    useEffect(() => {
        const loadCCEverywhere = async () => {
            if (window.CCEverywhere) {
                setCCEverywhere(window.CCEverywhere);
                return;
            }

            const script = document.createElement('script'); 
            script.src = 'https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js';
            script.async = true;
            script.onload = () => {
                setCCEverywhere(window.CCEverywhere);
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        };

        loadCCEverywhere();
    }, []);

    return ccEverywhere;
};


export default useCCEverywhere