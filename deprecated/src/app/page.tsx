import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "無名伺服器 | Nameless Realms"
};

export default function indexPage() {

    return (
        <div>

            {/* block 1 */}
            <div className="relative ">

                <div>
                    <video
                        preload="auto"
                        autoPlay={true}
                        loop={true}
                        muted={true}
                    >
                        <source
                            src="/video/front.mp4"
                            type="video/mp4"
                        />
                    </video>
                </div>

                <div>
                    <div>
                        <h1 className="text-lg">無名伺服器</h1>
                        <h1>模組生存</h1>
                        <div>

                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}