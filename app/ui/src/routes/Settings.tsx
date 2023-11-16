import {
    Button,
    SplitView,
    SplitViewListbox,
} from "@salesforce/design-system-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";

interface ListItemProps {
    id: string;
    label: string;
    value: string;
}

function ListItem(props: any) {
    return (
        <div className="slds-text-heading_small">
            {(props.item as ListItemProps).label}
        </div>
    );
}

export function Settings() {
    const [searchParams] = useSearchParams();
    const [title, setTitle] = useState<string>();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<ListItemProps[]>();

    useEffect(() => {
        setTitle(decodeURIComponent(searchParams.get("title") || ""));
    }, [searchParams]);

    function listView() {
        return [
            <SplitViewListbox
                key="1"
                events={{
                    onSelect: (event: any, val: any) => {
                        setSelected(val.selectedItems);
                        navigate(`${val.item.value}?title=${title}`);
                    },
                }}
                options={[
                    { id: "basic", label: "Basic", value: "basic" },
                    {
                        id: "thumbnails",
                        label: "Thumbnails",
                        value: "thumbnails",
                    },
                    { id: "gifs", label: "GIFs", value: "gifs" },
                    {
                        id: "embed-for-web",
                        label: "Embed for web",
                        value: "embed-for-web",
                    },
                ]}
                listItem={ListItem}
                selection={selected}
            />,
        ];
    }

    return (
        <div className="slds-var-p-around_medium">
            <div className="slds-grid slds-grid_align-spread">
                <div className="slds-col">
                    <div className="slds-grid">
                        <div className="slds-col slds-var-m-right_small">
                            <Button
                                variant="icon"
                                iconCategory="utility"
                                iconName="back"
                                iconSize="medium"
                                iconVariant="bare"
                                onClick={() => navigate("/")}
                            />
                        </div>
                        <div className="slds-col">
                            <div className="slds-text-heading_small">
                                {title}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="slds-col">
                    <div className="slds-grid">
                        <Button
                            variant="icon"
                            iconCategory="utility"
                            iconName="link"
                            iconSize="medium"
                            iconVariant="brand"
                        />
                        <Button
                            variant="icon"
                            iconCategory="utility"
                            iconName="download"
                            iconSize="medium"
                            iconVariant="brand"
                        />
                        <Button
                            variant="icon"
                            iconCategory="utility"
                            iconName="cut"
                            iconSize="medium"
                            iconVariant="brand"
                        />
                    </div>
                </div>
            </div>
            <div style={{ height: "90vh" }}>
                <SplitView
                    id="settingsSplitView"
                    master={listView()}
                    detail={
                        <div className="slds-var-p-around_medium">
                            <Outlet />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
