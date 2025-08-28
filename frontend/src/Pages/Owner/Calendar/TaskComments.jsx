import { Editor } from "@tinymce/tinymce-react";
import { Avatar, Button, List, message, Typography } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { createCommentApi, getCommentsByTaskId } from "../../../Contexts/api";

const { Title } = Typography;

const TaskComments = ({ taskId }) => {
    const user = useSelector((state) => state.auth.user);
    const userId = user?.id;

    const [comments, setComments] = useState([]);
    const [editorContent, setEditorContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!taskId) return;
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        try {
            const res = await getCommentsByTaskId(taskId);
            setComments(res.data);
        } catch (err) {
            message.error("Không thể tải bình luận");
        }
    };

    const handleAddComment = async () => {
        if (!editorContent.trim()) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("userId", userId || "anonymous");
            formData.append("content", editorContent);

            await createCommentApi(formData);
            toast.success("Gửi bình luận thành công");
            setEditorContent("");
            fetchComments();
        } catch (err) {
            toast.error("Gửi bình luận thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: 24 }}>
            <ToastContainer />
            <List
                itemLayout="horizontal"
                dataSource={comments}
                locale={{ emptyText: "Chưa có bình luận nào" }}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar>{item.userName ? item.userName[0] : "U"}</Avatar>}
                            title={<span>{item.userName || "Người dùng"}</span>}
                            description={
                                <div
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            }
                        />
                    </List.Item>
                )}
            />

            <div style={{ marginTop: 16 }}>
                <Editor
                    apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                    value={editorContent}
                    onEditorChange={(newValue) => setEditorContent(newValue)}
                    init={{
                        min_height: 150,
                        max_height: 600,
                        menubar: false,
                        plugins: [
                            "anchor", "autolink", "charmap", "codesample", "emoticons", "link",
                            "lists", "media", "searchreplace", "table", "visualblocks", "wordcount"
                        ],
                        toolbar:
                            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link media | removeformat",
                    }}
                />
                <Button
                    type="primary"
                    block
                    loading={loading}
                    style={{ marginTop: 12 }}
                    onClick={handleAddComment}
                >
                    Thêm bình luận
                </Button>
            </div>
        </div>
    );
};

export default TaskComments;
