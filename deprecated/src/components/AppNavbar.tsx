import { Navbar, NavbarBrand, Image } from "@heroui/react";

import nrLogoImg from "@/../public/images/logo/mckismetlab-title.png";

export default function AppNavbar() {

    return (
        <Navbar>
            <NavbarBrand>
                <Image
                    src={nrLogoImg}
                />
            </NavbarBrand>
        </Navbar>
    )
}