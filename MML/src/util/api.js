const baseUrl = 'https://t.minecraftmigos.me/example/v1';

export const getAllModpacks = async () => {
    try {
        const res = await fetch(baseUrl,  {
            method: 'GET',
        });

        if (!res.ok) {
            console.error('Failed to fetch modpacks');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching modpacks: ', error);
    }
};

