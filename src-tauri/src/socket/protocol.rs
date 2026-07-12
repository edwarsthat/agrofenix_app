use tokio_tungstenite::tungstenite::{client::IntoClientRequest, handshake::client::Request};

use crate::command::errors::SocketError;


pub fn build_ws_url(base:&str) -> String {
    let ws = base.replace("http://", "ws://").replace("https://", "wss://");
    format!("{ws}/ws")
}

pub fn build_request(url: &str, token: &str) -> Result<Request, SocketError> {
    let mut req = url.into_client_request()?;
    req.headers_mut().insert("Authorization", format!("Bearer {token}").parse()?);
    Ok(req)
}

pub fn extract_message_id(text: &str) -> Option<String> {
    serde_json::from_str::<serde_json::Value>(text)
        .ok()
        .and_then(|v| v.get("id")?.as_str().map(String::from))
}

pub fn build_envelop(id: &str, token: &str, info: &serde_json::Value) -> String {
    serde_json::json!({"id": id,"token": token, "payload": info,}).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_http_to_ws() {
        assert_eq!(build_ws_url("http://localhost:8080"), "ws://localhost:8080/ws");
    }

    #[test]
    fn converts_https_to_wss() {
        assert_eq!(build_ws_url("https://example.com"), "wss://example.com/ws");
    }

    #[test]
    fn leaves_url_without_known_scheme_unchanged() {
        assert_eq!(build_ws_url("localhost:8080"), "localhost:8080/ws");
    }

    #[test]
    fn does_not_double_replace_when_scheme_appears_again_in_path() {
        assert_eq!(
            build_ws_url("http://example.com/redirect?to=http://other.com"),
            "ws://example.com/redirect?to=ws://other.com/ws"
        );
    }

    #[test]
    fn build_request_sets_uri_and_authorization_header() {
        let req = build_request("ws://localhost:8080/ws", "my-token").unwrap();

        assert_eq!(req.uri(), "ws://localhost:8080/ws");
        assert_eq!(
            req.headers().get("Authorization").unwrap(),
            "Bearer my-token"
        );
    }

    #[test]
    fn build_request_fails_on_invalid_url() {
        let err = build_request("not a url", "my-token").unwrap_err();

        assert!(matches!(err, SocketError::Connection(_)));
    }

    #[test]
    fn build_request_fails_on_invalid_token_characters() {
        let err = build_request("ws://localhost:8080/ws", "bad\ntoken").unwrap_err();

        assert!(matches!(err, SocketError::InvalidHeader(_)));
    }

    #[test]
    fn extract_message_id_returns_id_when_present() {
        let text = r#"{"id": "abc123", "type": "message"}"#;

        assert_eq!(extract_message_id(text), Some("abc123".to_string()));
    }

    #[test]
    fn extract_message_id_returns_none_on_invalid_json() {
        assert_eq!(extract_message_id("not json"), None);
    }

    #[test]
    fn extract_message_id_returns_none_when_id_missing() {
        assert_eq!(extract_message_id(r#"{"type": "message"}"#), None);
    }

    #[test]
    fn extract_message_id_returns_none_when_id_is_not_a_string() {
        assert_eq!(extract_message_id(r#"{"id": 123}"#), None);
    }

    #[test]
    fn build_envelop_serializes_fields() {
        let info = serde_json::json!({"foo": "bar"});
        let envelop = build_envelop("abc123", "my-token", &info);

        let parsed: serde_json::Value = serde_json::from_str(&envelop).unwrap();
        assert_eq!(parsed["id"], "abc123");
        assert_eq!(parsed["token"], "my-token");
        assert_eq!(parsed["info"], info);
    }

    #[test]
    fn build_envelop_preserves_nested_info_structure() {
        let info = serde_json::json!({"nested": {"a": 1, "b": [1, 2, 3]}});
        let envelop = build_envelop("id", "token", &info);

        let parsed: serde_json::Value = serde_json::from_str(&envelop).unwrap();
        assert_eq!(parsed["info"], info);
    }
}