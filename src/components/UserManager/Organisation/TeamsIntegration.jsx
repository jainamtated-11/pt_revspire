import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../context/GlobalState';
import { FaSpinner } from 'react-icons/fa';

export const handleTeamsAuth = async (code, viewer_id, axiosInstance) => {
    try {
        const decodedCode = decodeURIComponent(code);
        const response = await axiosInstance.post('/microsoft-teams/teams-oauth-callback', { code: decodedCode });
        if (response.status === 200) toast.success("Teams connected successfully!");
        else toast.error("Failed to connect Teams");
    } catch (error) {
        console.error("Error during Teams authorization:", error);
        toast.error("Error connecting to Teams");
    }
};

const TeamsIntegration = () => {
    const { viewer_id, organisation_id } = useContext(GlobalContext);
    const axiosInstance = useAxiosInstance();

    const [isInstalled, setIsInstalled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [tenantId, setTenantId] = useState("");
    const [existingGroup, setExistingGroup] = useState(null);

    useEffect(() => {
        const checkInstallation = async () => {
            try {
                const response = await axiosInstance.post('microsoft-teams/check-installation', { viewer_id });
                if (response.data) {
                    setIsInstalled(response.data.installed);
                    setTenantId(response.data.tenantId || "");

                if (response.data.groupName && response.data.groupId) {
                    setExistingGroup({
                        id: response.data.groupId,
                        name: response.data.groupName
                    });
                }

                }
            } catch (error) {
                console.error("Error checking installation:", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkInstallation();
    }, [viewer_id]);

    const handleInstall = () => window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=d8bdbb2c-52a8-4fb7-a82f-2bdaa5cbbbed&response_type=code&redirect_uri=${encodeURIComponent("https://redirection.revspire.io/teams-integration")}&scope=offline_access%20https://graph.microsoft.com/.default&state=${encodeURIComponent(JSON.stringify({ originURL: encodeURIComponent(window.location.href + `?userId=${viewer_id}`) }))}`;

    const sendTestMessage = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.post('microsoft-teams/send-message', {
                viewer_id,
                messageText: "This is a test message from Revspire"
            });
            res.data.success ? toast.success("Test message sent!") : toast.error("Message failed.");
        } catch {
            toast.error("Error sending message");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.post('microsoft-teams/disconnect', { viewer_id });
            if (res.data.success) {
                toast.success("Disconnected");
                setIsInstalled(false);
                setTenantId("");
            } else toast.error("Failed to disconnect");
        } catch {
            toast.error("Error disconnecting");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
    }

    return (
        <div className="space-y-4">
            {isInstalled ? (
                <>
                    <div className="text-sm text-green-700">✅ Bot Installed</div>
                    {tenantId && <div className="text-sm text-gray-700">Tenant ID: <span className="font-mono">{tenantId}</span></div>}

                    <div className="flex flex-wrap gap-2 mt-2">
                        <button onClick={sendTestMessage} disabled={isLoading} className="bg-[#6264A7] text-white px-4 py-2 rounded hover:bg-[#464775]">
                            {isLoading ? 'Sending...' : 'Send Test Message'}
                        </button>

                        <button onClick={handleDisconnect} disabled={isLoading} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                            {isLoading ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                    </div>
                </>
            ) : (
                <div>
                    <p className="text-gray-600 mb-4">Install our bot in Microsoft Teams to enable messaging and channel creation.</p>
                    <button
                        onClick={handleInstall}
                        className="w-fit bg-[#6264A7] hover:bg-[#464775] text-white font-medium py-2 px-4 rounded inline-flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                            <path d="M19 3h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 8h-6V5h6v6zM9 3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 8H5V5h4v6zm10 4h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm0 8h-6v-6h6v6zM9 13H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm0 8H5v-6h4v6z"/>
                        </svg>
                        Add to Teams
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeamsIntegration;