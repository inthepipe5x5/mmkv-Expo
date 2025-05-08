// {
//     "id": 31871577,
//     "width": 4000,
//     "height": 6000,
//     "url": "https://www.pexels.com/photo/cultural-gathering-in-nigeria-s-capital-31871577/",
//     "photographer": "Abdullahi Santuraki",
//     "photographer_url": "https://www.pexels.com/@abdullahi-santuraki-615175419",
//     "photographer_id": 615175419,
//     "avg_color": "#7D7572",
//     "src": {
//         "original": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg",
//         "large2x": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
//         "large": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
//         "medium": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&h=350",
//         "small": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&h=130",
//         "portrait": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
//         "landscape": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
//         "tiny": "https://images.pexels.com/photos/31871577/pexels-photo-31871577.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280"
//     },
//     "liked": false,
//     "alt": "THE JIHAD (CIRCA '25)"
// },

export type PexelsResponseImageSrcKey = "tiny" | "portrait" | "landscape" | "small" | "medium" | "large" | "large2x" | "original"; //key in src object

export type PexelsResponseImageObject = {
    id: string;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: Record<PexelsResponseImageSrcKey, string>;
    liked: boolean;
    alt: string;
}

export type PexelsResponse = {
    page: number;
    per_page: number;
    total_results: number;
    next_page: string | null;
    photos: PexelsResponseImageObject[];
}





