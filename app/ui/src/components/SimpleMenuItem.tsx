import { MouseEvent } from "react";

export type ItemClickProps = Pick<Props, "id" | "label" | "value">;

export interface Props {
    id: string;
    label: string;
    value?: string;
    href?: string;
    title?: string;
    submenu?: Props;
    onClick?: (props: ItemClickProps) => void;
}

function onClickMenuItem(e: MouseEvent<HTMLAnchorElement>, props: Props) {
    if (e.currentTarget.href === "#") {
        e.preventDefault();
    }

    if (props.onClick) {
        props.onClick({ id: props.id, label: props.label, value: props.value });
    }
}

/**
 * Use this only when you want to use control how the menu items are rendered
 * in a menu. Otherwise, use the Dropdown component from the
 * `@salesforce/design-system-react package`.
 */
export function SimpleMenuItem(props: Props) {
    return (
        <li className="slds-dropdown__item" role="presentation">
            <a
                href={props.href ?? "#"}
                {...(props.href && props.href.startsWith("https://")
                    ? { rel: "noopener", target: "_blank" }
                    : {})}
                role="menuitem"
                tabIndex={-1}
                title={props.title || props.label}
                onClick={(e) => onClickMenuItem(e, props)}
            >
                <span className="slds-truncate">{props.label}</span>
            </a>
        </li>
    );
}
