namespace Ovvycmb.Core.Exceptions;

public class OvvycmbException : Exception
{
    public string ErrorCode { get; }
    public OvvycmbException(string errorCode, string message, Exception? inner = null)
        : base(message, inner) => ErrorCode = errorCode;
}

public class WindowManagerException(string message, Exception? inner = null)
    : OvvycmbException("WINDOW_MANAGER_ERROR", message, inner);

public class HotkeyException(string message, Exception? inner = null)
    : OvvycmbException("HOTKEY_ERROR", message, inner);

public class StorageException(string message, Exception? inner = null)
    : OvvycmbException("STORAGE_ERROR", message, inner);

public class PluginException(string message, Exception? inner = null)
    : OvvycmbException("PLUGIN_ERROR", message, inner);

public class AgentException(string message, Exception? inner = null)
    : OvvycmbException("AGENT_ERROR", message, inner);
